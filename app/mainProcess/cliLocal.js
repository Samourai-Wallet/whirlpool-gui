import { download } from 'electron-dl';
import tcpPortUsed from 'tcp-port-used';

import md5ify from 'md5ify';
import fs from 'fs';
import { spawn } from 'child_process';
import Store from 'electron-store';
import {
  CLI_CHECKSUM,
  CLI_FILENAME,
  CLI_LOG_FILE,
  CLI_URL,
  CLILOCAL_STATUS,
  DEFAULT_CLI_LOCAL,
  DEFAULT_CLIPORT,
  DL_PATH,
  IPC_CLILOCAL,
  STORE_CLILOCAL
} from '../const';
import { logger } from '../utils/logger';


//const STORE_CLI_FILENAME = 'CLI_FILENAME'
//const STORE_CLI_URL = 'CLI_URL'
//const STORE_CLI_CHECKSUM = 'CLI_CHECKSUM'
export class CliLocal {

  constructor(ipcMain, window) {
    this.state = {}

    this.ipcMain = ipcMain
    this.window = window
    this.dlPath = DL_PATH
    this.store = new Store()

    this.ipcMain.on(IPC_CLILOCAL.RELOAD, this.reload.bind(this))
    this.ipcMain.on(IPC_CLILOCAL.GET_STATE, this.onGetState.bind(this));

    this.cliFilename = undefined
    this.cliUrl = undefined
    this.cliChecksum = undefined

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
    if (this.state.status !== CLILOCAL_STATUS.DOWNLOADING) {
      this.refreshState()
      this.pushState()
    }
  }

  reload() {
    logger.info("CLI reloading...")
    this.stop()

    this.cliFilename = this.getCliFilename()
    this.cliUrl = this.getCliUrl()
    this.cliChecksum = this.getCliChecksum()

    this.state = {
      valid: undefined,
      started: undefined,
      status: undefined,
      info: undefined,
      error: undefined,
      progress: undefined
    }
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
    return CLI_FILENAME//this.getStoreOrSetDefault(STORE_CLI_FILENAME, CLI_FILENAME)
  }
  getCliUrl() {
    return CLI_URL//this.getStoreOrSetDefault(STORE_CLI_URL, CLI_URL)
  }
  getCliChecksum() {
    return CLI_CHECKSUM//this.getStoreOrSetDefault(STORE_CLI_CHECKSUM, CLI_CHECKSUM)
  }
  isCliLocal() {
    return this.getStoreOrSetDefault(STORE_CLILOCAL, DEFAULT_CLI_LOCAL)
  }

  refreshState(downloadIfMissing=true) {
    const myThis = this
    this.state.valid = this.verifyChecksum()
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
        this.download(CLI_URL).then(() => {
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
      console.error("CliLocal: start skipped: not valid")
      return
    }
    if (this.state.started) {
      console.error("CliLocal: start skipped: already started")
      return
    }
    const myThis = this
    tcpPortUsed.check(DEFAULT_CLIPORT, 'localhost')
      .then(function() {
        // port is available => start proc
        myThis.state.started = new Date().getTime()
        myThis.pushState()
        const cmd = 'java'
        const args = ['-jar', myThis.cliFilename, '--listen', '--debug', '--pool=0.01btc', '--auto-tx0', '--auto-mix', '--auto-aggregate-postmix']
        myThis.startProc(cmd, args, myThis.dlPath, CLI_LOG_FILE)
      }, function() {
        // port in use => cannot start proc
        logger.error("CLI cannot start: port "+DEFAULT_CLIPORT+" already in use (another instance is running)")
        myThis.state.error = 'CLI cannot start: port '+DEFAULT_CLIPORT+' already in use'
        myThis.updateState(CLILOCAL_STATUS.ERROR)
      });
  }

  startProc(cmd, args, cwd, logFile) {
    const log = fs.createWriteStream(logFile, {flags: 'a'})
    const myThis = this

    const cmdStr = cmd+' '+args.join(' ')
    logger.info('CLI start: '+cmdStr+' (cwd='+cwd+')')
    log.write('=> CLI start: '+cmdStr+' (cwd='+cwd+')\n')
    this.cliProc = spawn(cmd, args, {cwd: cwd})
    this.cliProc.on('error', function( err ) {
      logger.error('CLI error: ', err)
      log.write('=> Error: '+err+'\n')
    })
    this.cliProc.on('exit', (code) => {
      // finishing
      log.write('=> CLI ended: code='+code+'\n')
      logger.warn('CLI ended: code='+code)
      myThis.stop()
    })

    this.cliProc.stdout.on('data', function (data) {
      const dataStr = data.toString()
      console.log('[cli] ' + dataStr.substring(0, (dataStr.length-1)));
      log.write(data)
    });
    this.cliProc.stderr.on('data', function (data) {
      const dataStr = data.toString()
      console.log('[cli.err] ' + dataStr.substring(0, (dataStr.length-1)));
      log.write('[ERR]'+data)
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

  verifyChecksum() {
    const dlPathFile = this.dlPath+'/'+this.cliFilename
    try {
      const md5sum = md5ify(dlPathFile)
      if (!md5sum) {
        logger.error('CLI not found: '+dlPathFile)
        return false;
      }
      if (md5sum !== this.cliChecksum) {
        logger.error('CLI is invalid: '+dlPathFile+', '+md5sum+' vs '+this.cliChecksum)
        return false;
      }
    } catch(e) {
      logger.error('CLI not found: '+dlPathFile)
      return false;
    }
    logger.debug('CLI is valid: '+dlPathFile)
    return true
  }

  download(url) {
    this.updateState(CLILOCAL_STATUS.DOWNLOADING)

    const onProgress = progress => {
      logger.verbose('CLI downloading, progress='+progress)
      const progressPercent = parseInt(progress * 100)
      this.state.progress = progressPercent
      this.updateState(CLILOCAL_STATUS.DOWNLOADING)
    }
    logger.info('CLI downloading: '+url+', checksum='+this.cliChecksum)
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
}
