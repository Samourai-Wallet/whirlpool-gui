import { download } from 'electron-dl';
import tcpPortUsed from 'tcp-port-used';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import Store from 'electron-store';
import AwaitLock from 'await-lock';
import ps from 'ps-node';
import {
  CLI_CONFIG_FILENAME,
  CLI_LOG_ERROR_FILE,
  CLI_LOG_FILE,
  cliApiService,
  CLILOCAL_STATUS,
  DEFAULT_CLI_LOCAL,
  DEFAULT_CLIPORT,
  IPC_CLILOCAL,
  IS_DEV,
  STORE_CLILOCAL
} from '../const';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const START_TIMEOUT = 10000
const ARG_CLI_GUI = '--whirlpool-cli-gui'

export class CliLocal {

  constructor(ipcMain, window) {
    this.state = {}

    this.ipcMain = ipcMain
    this.window = window

    this.store = new Store()
    this.ipcMutex = new AwaitLock()

    this.onIpcMain = this.onIpcMain.bind(this)
    this.ipcMain.on(IPC_CLILOCAL.RELOAD, () => this.onIpcMain(IPC_CLILOCAL.RELOAD))
    this.ipcMain.on(IPC_CLILOCAL.GET_STATE, () => this.onIpcMain(IPC_CLILOCAL.GET_STATE));
    this.ipcMain.on(IPC_CLILOCAL.DELETE_CONFIG, () => this.onIpcMain(IPC_CLILOCAL.DELETE_CONFIG));

    this.findCliProcesses = this.findCliProcesses.bind(this)

    this.handleExit()

    this.reload()
  }

  async onIpcMain(id) {
    await this.ipcMutex.acquireAsync();
    try {
      switch(id) {
        case IPC_CLILOCAL.RELOAD: await this.reload(true); break
        case IPC_CLILOCAL.GET_STATE: await this.onGetState(true); break
        case IPC_CLILOCAL.DELETE_CONFIG: await this.onDeleteConfig(true); break
      }
    } finally {
      this.ipcMutex.release();
    }
  }

  handleExit() {

    // kill CLI on exit
    process.stdin.resume();//so the program will not close instantly

    const exitHandler = () => {
      logger.info("whirlpool-gui is terminating.")
      this.stop(true) // kill immediately
      process.exit()
    }
    //do something when app is closing
    process.on('exit', exitHandler);

    //catches ctrl+c event
    process.on('SIGINT', exitHandler);

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler);
  }

  async onGetState(gotMutex=false) {
    if (!gotMutex) {
      await this.ipcMutex.acquireAsync();
    }
    try {
      this.pushState()
    } finally {
      if (!gotMutex) {
        this.ipcMutex.release();
      }
    }
  }

  resetState() {
    this.state = {
      valid: undefined,
      started: undefined,
      status: undefined,
      info: undefined,
      error: undefined,
      progress: undefined,
      cliApi: undefined
    }
  }

  async reload(gotMutex=false) {
    logger.info("CLI reloading...")
    await this.stop(gotMutex)

    this.resetState()

    await this.refreshState(true, gotMutex)
  }

  async onDeleteConfig(gotMutex=false) {
    const cliConfigPath = cliApiService.getCliPath()+'/'+CLI_CONFIG_FILENAME
    logger.info("CLI deleting local config... "+cliConfigPath)

    await this.stop(gotMutex)

    // delete local config
    if (fs.existsSync(cliConfigPath)) {
      try {
        await fs.unlinkSync(cliConfigPath)
      } catch (e) {
        logger.error("unable to unlink " + cliConfigPath, e)
      }
    }

    this.resetState()
  }

  getStoreOrSetDefault(key, defaultValue) {
    let value = this.store.get(key)
    if (value === undefined) {
      this.store.set(key, defaultValue)
      value = defaultValue
    }
    return value
  }

  getCliFilename() {
    return this.state.cliApi.filename
  }
  getCliUrl() {
    return this.state.cliApi.url
  }
  getCliChecksum() {
    return this.state.cliApi.checksum
  }
  isCliLocal() {
    return this.getStoreOrSetDefault(STORE_CLILOCAL, DEFAULT_CLI_LOCAL)
  }

  async refreshState(downloadIfMissing=true, gotMutex=false) {
    if (cliApiService.isApiModeLocal()) {
      downloadIfMissing = false
    }

    const javaInstalled = await this.isJavaInstalled()
    if (!javaInstalled) {
      this.state.valid = false
      this.state.error = 'Please install JAVA 8+ (OpenJDK recommended)'
      this.updateState(CLILOCAL_STATUS.ERROR)
      await this.stop(gotMutex)
      return
    }

    try {
      this.state.cliApi = await cliApiService.fetchCliApi()
    } catch(e) {
      logger.error("Could not fetch CLI_API", e)
      this.state.valid = false
      this.state.error = 'Could not fetch CLI_API'
      this.updateState(CLILOCAL_STATUS.ERROR)
      await this.stop(gotMutex)
      return
    }

    const myThis = this
    this.state.valid = await this.verifyChecksum()
    if (!this.state.valid) {
      if (this.state.started) {
        logger.info("CLI is invalid, stopping.")
        await this.stop(gotMutex)
      }
      if (downloadIfMissing) {
        if (this.state.status === CLILOCAL_STATUS.DOWNLOADING || this.state.status === CLILOCAL_STATUS.ERROR) {
          console.log('refreshState: download skipped, status='+this.state.status+')')
          return
        }
        // download
        this.download(this.getCliUrl()).then(() => {
          logger.info('CLI: download success')
          myThis.state.info = undefined
          myThis.state.error = undefined
          myThis.state.progress = undefined
          myThis.refreshState(false)
        }).catch(e => {
          logger.error('CLI: Download error', e)
          myThis.state.info = undefined
          myThis.state.error = 'Download error'
          myThis.state.progress = undefined
          myThis.updateState(CLILOCAL_STATUS.ERROR)
        })
      } else {
        logger.error('CLI: download failed')
        this.state.info = undefined
        this.state.error = 'Could not download CLI'
        myThis.state.progress = undefined
        this.updateState(CLILOCAL_STATUS.ERROR)
      }
    } else {
      this.state.error = undefined
      this.updateState(CLILOCAL_STATUS.READY)
      if (!this.state.started && this.isCliLocal()) {
        await this.start(gotMutex)
      }
    }
  }

  async isJavaInstalled() {
    try {
      const result = await this.execPromise('java -version')
      console.log("[CLI_LOCAL] java seems installed. "+result)
      return true
    } catch (e) {
      console.error("[CLI_LOCAL] java is NOT installed: "+e.message)
      return false
    }
  }

  execPromise(command) {
    return new Promise(function(resolve, reject) {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stdout.trim());
      });
    });
  }

  async start(gotMutex=false) {
    if (!gotMutex) {
      await this.ipcMutex.acquireAsync();
    }
    try {
      if (!this.state.valid) {
        console.error("[CLI_LOCAL] start skipped: not valid")
        return
      }
      if (this.state.started) {
        console.error("[CLI_LOCAL] start skipped: already started")
        return
      }
      const myThis = this
      await tcpPortUsed.waitUntilFreeOnHost(DEFAULT_CLIPORT, 'localhost', 1000, START_TIMEOUT)
        .then(() => {
          // port is available => start proc
          myThis.state.started = new Date().getTime()
          myThis.pushState()
          const cmd = 'java'
          const args = ['-jar', myThis.getCliFilename(), '--listen', '--debug', ARG_CLI_GUI]
          if (IS_DEV) {
            args.push('--debug-client')
          }
          myThis.startProc(cmd, args, cliApiService.getCliPath(), CLI_LOG_FILE, CLI_LOG_ERROR_FILE)
        }, (e) => {
          // port in use => cannot start proc
          logger.error("[CLI_LOCAL] cannot start: port "+DEFAULT_CLIPORT+" already in use")

          // lookup running processes
          myThis.findCliProcesses(cliProcesses => {
            if (cliProcesses.length > 0) {
              for (const i in cliProcesses) {
                const cliProcess = cliProcesses[i]

                logger.debug('Foud CLI proces => killing', cliProcess);
                ps.kill(cliProcess.pid, err => {
                  if (err) {
                    logger.error('Kill ' + cliProcess.pid + ' FAILED', err)
                  } else {
                    logger.debug('Kill ' + cliProcess.pid + ' SUCCESS');
                  }
                });
              }

              // retry start
              this.state.error = undefined
              this.updateState(CLILOCAL_STATUS.READY)
              myThis.start(true)
            }
          })

          myThis.state.error = 'CLI cannot start: port '+DEFAULT_CLIPORT+' already in use'
          myThis.updateState(CLILOCAL_STATUS.ERROR)
        });
    } finally {
      if (!gotMutex) {
        this.ipcMutex.release();
      }
    }
  }

  findCliProcesses(callback) {
    callback = callback.bind(this)

    return ps.lookup({
      command: 'java',
      psargs: 'ux'
    }, function(err, resultList ) {
      if (err) {
        throw new Error( err );
      }
      const processes = []
      resultList.forEach(function( process ){
        if( process ){
          if (process.arguments && process.arguments.indexOf('-jar') !== -1  && process.arguments.indexOf(ARG_CLI_GUI) !== -1) {
            processes.push(process)
          }
        }
      });
      callback(processes)
    });
  }

  startProc(cmd, args, cwd, logFile, logErrorFile) {
    const cliLog = fs.createWriteStream(logFile, {flags: 'a'})
    const cliLogError = fs.createWriteStream(logErrorFile, {flags: 'a'})
    const myThis = this

    const cmdStr = cmd+' '+args.join(' ')
    cliLog.write('[CLI_LOCAL] => start: '+cmdStr+' (cwd='+cwd+')\n')
    cliLogError.write('[CLI_LOCAL] => start: '+cmdStr+' (cwd='+cwd+')\n')
    logger.info('[CLI_LOCAL] => start: '+cmdStr+' (cwd='+cwd+')')
    try {
      this.cliProc = spawn(cmd, args, { cwd: cwd })
      this.cliProc.on('error', function(err) {
        cliLog.write('[CLI_LOCAL][ERROR] => ' + err + '\n')
        cliLogError.write('[CLI_LOCAL][ERROR] => ' + err + '\n')
        logger.error('[CLI_LOCAL] => ', err)
        myThis.state.info = undefined
        myThis.state.error = ''+err
        myThis.state.progress = undefined
        myThis.updateState(CLILOCAL_STATUS.ERROR)
      })
      this.cliProc.on('exit', (code) => {
        let reloading = false
        if (code == 0) {
          // finishing normal
          cliLog.write('[CLI_LOCAL] => terminated without error.\n')
          cliLogError.write('[CLI_LOCAL] => terminated without error.\n')
          logger.info('[CLI_LOCAL] => terminated without error.')
        } else {
          // finishing with error
          if (code === 143) {
            // reloading? TODO
            reloading = true
            cliLog.write('[CLI_LOCAL] => terminated for reloading...\n')
            cliLogError.write('[CLI_LOCAL] => terminated for reloading...\n')
            logger.error('[CLI_LOCAL] => terminated for reloading...')
          } else {
            cliLog.write('[CLI_LOCAL][ERROR] => terminated with error: ' + code + '\n')
            cliLogError.write('[CLI_LOCAL][ERROR] => terminated with error: ' + code + '\n')
            logger.error('[CLI_LOCAL][ERROR] => terminated with error: ' + code + '. Check logs for details')
            myThis.state.info = undefined
            myThis.state.error = 'CLI terminated with error: '+code+'. Check logs for details.'
            myThis.state.progress = undefined
            myThis.updateState(CLILOCAL_STATUS.ERROR)
          }
        }
        if (!reloading) {
          myThis.stop(true, false) // just update state
        }
      })

      this.cliProc.stdout.on('data', function(data) {
        const dataStr = data.toString()
        const dataLine = dataStr.substring(0, (dataStr.length - 1))
        console.log('[CLI_LOCAL] ' + dataLine);
        cliLog.write(data)

        // log java errors to CLI error file
        if (dataStr.match(/ ERROR ([0-9]+) \-\-\- /g)) {
          console.error('[CLI_LOCAL][ERROR] ' + dataLine);
          logger.error('[CLI_LOCAL][ERROR] ' + dataLine)
          cliLogError.write('[ERROR]' + data)
        }
      });
      this.cliProc.stderr.on('data', function(data) {
        const dataStr = data.toString()
        const dataLine = dataStr.substring(0, (dataStr.length - 1))
        console.error('[CLI_LOCAL][ERROR] ' + dataLine);
        logger.error('[CLI_LOCAL][ERROR] ' + dataLine)
        cliLog.write('[ERROR]' + data)
        cliLogError.write('[ERROR]' + data)

        //myThis.state.error = dataLine
        //myThis.updateState(CLILOCAL_STATUS.ERROR)
      });
    } catch(e) {
      myThis.stop(true)
    }
  }

  async stop(gotMutex=false, kill=true) {
    if (!gotMutex) {
      await this.ipcMutex.acquireAsync();
    }
    try {
      if (!this.state.started) {
        console.error("CliLocal: stop skipped: not started")
        return
      }

      this.state.started = false
      this.pushState()

      if (this.cliProc && kill) {
        logger.info('CLI stop')
        this.cliProc.stdout.pause()
        this.cliProc.stderr.pause()
        this.cliProc.kill()
      }
    } finally {
      if (!gotMutex) {
        this.ipcMutex.release();
      }
    }
  }

  async verifyChecksum() {
    const dlPathFile = cliApiService.getCliPath()+'/'+this.getCliFilename()
    const expectedChecksum = this.getCliChecksum()
    try {
      const checksum = await this.sha256File(dlPathFile)
      if (!checksum) {
        logger.error('CLI not found: '+dlPathFile)
        return false;
      }
      if (cliApiService.useChecksum() && checksum !== expectedChecksum) {
        logger.error('CLI is invalid: '+dlPathFile+', '+checksum+' vs '+expectedChecksum)
        return false;
      }
      logger.debug('CLI is valid: ' + dlPathFile)
      return true
    } catch(e) {
      logger.error('CLI not found: '+dlPathFile)
      return false;
    }
  }

  async download(url) {
    // delete existing file if any
    const dlPathFile = cliApiService.getCliPath()+'/'+this.getCliFilename()
    if (fs.existsSync(dlPathFile)) {
      logger.verbose('CLI overwriting '+dlPathFile)
      try {
        await fs.unlinkSync(dlPathFile)
      } catch (e) {
        logger.error("unable to unlink " + dlPathFile, e)
      }
    }

    this.updateState(CLILOCAL_STATUS.DOWNLOADING)

    const onProgress = progress => {
      logger.verbose('CLI downloading, progress='+progress)
      const progressPercent = parseInt(progress * 100)
      this.state.progress = progressPercent
      this.updateState(CLILOCAL_STATUS.DOWNLOADING)
    }
    logger.info('CLI downloading: '+url)
    return download(this.window, url, {directory: cliApiService.getCliPath(), onProgress: onProgress.bind(this)})
  }

  updateState(status) {
    this.state.status = status
    this.pushState()
  }

  pushState () {
    console.log('cliLocal: pushState',this.state)
    this.window.send(IPC_CLILOCAL.STATE, this.state)
  }

  sha256File(filename, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
      let shasum = crypto.createHash(algorithm);
      try {
        let s = fs.ReadStream(filename)
        s.on('data', function (data) {
          shasum.update(data)
        })
        // making digest
        s.on('end', function () {
          const hash = shasum.digest('hex')
          return resolve(hash);
        })
        s.on('error', function () {
          return reject('file read error: '+filename);
        })
      } catch (error) {
        return reject('checksum failed');
      }
    });
  }
}
