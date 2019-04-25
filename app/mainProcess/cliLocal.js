import { download } from 'electron-dl';
import tcpPortUsed from 'tcp-port-used';
import fs from 'fs';
import { spawn } from 'child_process';
import Store from 'electron-store';
import {
  API_VERSION, CLI_CONFIG_FILENAME,
  CLI_LOG_FILE,
  CLILOCAL_STATUS,
  DEFAULT_CLI_LOCAL,
  DEFAULT_CLIPORT,
  DL_PATH,
  GUI_LOG_FILE,
  IPC_CLILOCAL,
  STORE_CLILOCAL
} from '../const';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import cliVersion from './cliVersion';

const START_TIMEOUT = 20000
export class CliLocal {

  constructor(ipcMain, window) {
    this.state = {}

    this.ipcMain = ipcMain
    this.window = window
    this.dlPath = DL_PATH
    this.store = new Store()

    this.ipcMain.on(IPC_CLILOCAL.RELOAD, this.reload.bind(this))
    this.ipcMain.on(IPC_CLILOCAL.GET_STATE, this.onGetState.bind(this));
    this.ipcMain.on(IPC_CLILOCAL.DELETE_CONFIG, this.onDeleteConfig.bind(this));

    this.handleExit()

    this.reload()
  }

  handleExit() {

    // kill CLI on exit
    process.stdin.resume();//so the program will not close instantly

    const exitHandler = () => {
      logger.info("whirlpool-gui is terminating.")
      this.stop()
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

  onGetState() {
    this.pushState()
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

  async reload() {
    logger.info("CLI reloading...")
    this.stop()

    this.resetState()

    await this.refreshState()
  }

  async onDeleteConfig() {
    const cliConfigPath = this.dlPath+'/'+CLI_CONFIG_FILENAME
    logger.info("CLI deleting local config... "+cliConfigPath)

    this.stop()

    // delete local config
    try {
      await fs.unlink(cliConfigPath)
    } catch(e) {}

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

  async refreshState(downloadIfMissing=true) {

    try {
      const cliApi = await cliVersion.fetchCliApi(API_VERSION)
      logger.info('using CLI_API ' + API_VERSION, cliApi)
      this.state.cliApi = {
        cliVersion: cliApi.CLI_VERSION,
        filename: 'whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar',
        url: 'https://github.com/Samourai-Wallet/whirlpool-runtimes/releases/download/cli-' + cliApi.CLI_VERSION + '/whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar',
        checksum: cliApi.CLI_CHECKSUM
      }
    } catch(e) {
      logger.error("Could not fetch CLI_API "+API_VERSION, e)
      this.state.valid = false
      this.state.error = 'Could not fetch CLI_API '+API_VERSION
      this.updateState(CLILOCAL_STATUS.ERROR)
      this.stop()
      return
    }

    const myThis = this
    this.state.valid = await this.verifyChecksum()
    if (!this.state.valid) {
      if (this.state.started) {
        logger.info("CLI is invalid, stopping.")
        this.stop()
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
      this.updateState(CLILOCAL_STATUS.READY)
      if (!this.state.started && this.isCliLocal()) {
        this.start()
      }
    }
  }

  start() {
    if (!this.state.valid) {
      console.error("[CLI_LOCAL] start skipped: not valid")
      return
    }
    if (this.state.started) {
      console.error("[CLI_LOCAL] start skipped: already started")
      return
    }
    const myThis = this
    tcpPortUsed.waitUntilFreeOnHost(DEFAULT_CLIPORT, 'localhost', 1000, START_TIMEOUT)
      .then(() => {
        // port is available => start proc
        myThis.state.started = new Date().getTime()
        myThis.pushState()
        const cmd = 'java'
        const args = ['-jar', myThis.getCliFilename(), '--listen', '--debug']
        myThis.startProc(cmd, args, myThis.dlPath, CLI_LOG_FILE)
      }, (e) => {
        // port in use => cannot start proc
        logger.error("[CLI_LOCAL] cannot start: port "+DEFAULT_CLIPORT+" already in use")
        myThis.state.error = 'CLI cannot start: port '+DEFAULT_CLIPORT+' already in use'
        myThis.updateState(CLILOCAL_STATUS.ERROR)
      });
  }

  startProc(cmd, args, cwd, logFile) {
    const cliLog = fs.createWriteStream(logFile, {flags: 'a'})
    const myThis = this

    const cmdStr = cmd+' '+args.join(' ')
    cliLog.write('[CLI_LOCAL] => start: '+cmdStr+' (cwd='+cwd+')\n')
    logger.info('[CLI_LOCAL] => start: '+cmdStr+' (cwd='+cwd+')')
    this.cliProc = spawn(cmd, args, {cwd: cwd})
    this.cliProc.on('error', function( err ) {
      cliLog.write('[CLI_LOCAL][ERROR] => '+err+'\n')
      logger.error('[CLI_LOCAL] => ', err)
    })
    this.cliProc.on('exit', (code) => {
      if (code == 0) {
        // finishing normal
        cliLog.write('[CLI_LOCAL] => terminated without error.\n')
        logger.info('[CLI_LOCAL] => terminated without error.')
      } else {
        // finishing with error
        cliLog.write('[CLI_LOCAL][ERROR] => terminated with error: '+code+'\n')
        logger.error('[CLI_LOCAL] => terminated with error: '+code+'. Check logs for details ('+GUI_LOG_FILE+')')
      }
      myThis.stop()
    })

    this.cliProc.stdout.on('data', function (data) {
      const dataStr = data.toString()
      const dataLine = dataStr.substring(0, (dataStr.length-1))
      console.log('[CLI_LOCAL] ' + dataLine);
      cliLog.write(data)
    });
    this.cliProc.stderr.on('data', function (data) {
      const dataStr = data.toString()
      const dataLine = dataStr.substring(0, (dataStr.length-1))
      console.error('[CLI_LOCAL] ' + dataLine);
      logger.error('[CLI_LOCAL] '+dataLine)
      cliLog.write('[ERROR]'+data)
    });
  }

  stop() {
    if (!this.state.started) {
      console.error("CliLocal: stop skipped: not started")
      return
    }

    this.state.started = false
    this.pushState()

    if (this.cliProc) {
      logger.info('CLI stop')
      this.cliProc.stdout.pause()
      this.cliProc.stderr.pause()
      this.cliProc.kill()
    }
  }

  async verifyChecksum() {
    const dlPathFile = this.dlPath+'/'+this.getCliFilename()
    const expectedChecksum = this.getCliChecksum()
    try {
      const checksum = await this.sha256File(dlPathFile)
      if (!checksum) {
        logger.error('CLI not found: '+dlPathFile)
        return false;
      }
      if (checksum !== expectedChecksum) {
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

  download(url) {
    this.updateState(CLILOCAL_STATUS.DOWNLOADING)

    const onProgress = progress => {
      logger.verbose('CLI downloading, progress='+progress)
      const progressPercent = parseInt(progress * 100)
      this.state.progress = progressPercent
      this.updateState(CLILOCAL_STATUS.DOWNLOADING)
    }
    logger.info('CLI downloading: '+url)
    return download(this.window, url, {directory: this.dlPath, onProgress: onProgress.bind(this)})
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
