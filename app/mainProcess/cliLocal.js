import { BrowserWindow, app } from 'electron';
import { download } from 'electron-dl';
import md5ify from 'md5ify';
import fs from 'fs';
import { spawn } from 'child_process';
import Store from 'electron-store';
import {
  DEFAULT_CLI_LOCAL,
  CLILOCAL_STATUS,
  IPC_CLILOCAL,
  STORE_CLILOCAL,
  DL_PATH,
  LOG_FILE,
  getDlPath, getLogFile
} from '../const';

const CLI_FILENAME = "whirlpool-client-cli-develop-SNAPSHOT-run.jar";
const CLI_URL = "https://file.io/7G4siX";
const CLI_CHECKSUM = "4d5152a5b564cd3473be1874e0965044";

const STORE_CLI_FILENAME = 'CLI_FILENAME'
const STORE_CLI_URL = 'CLI_URL'
const STORE_CLI_CHECKSUM = 'CLI_CHECKSUM'
export class CliLocal {

  constructor(ipcMain, window) {
    this.state = {}

    this.ipcMain = ipcMain
    this.window = window
    this.dlPath = getDlPath(app)
    this.store = new Store()

    this.ipcMain.on(IPC_CLILOCAL.RELOAD, this.reload.bind(this))
    this.ipcMain.on(IPC_CLILOCAL.GET_STATE, this.onGetState.bind(this));

    this.cliFilename = undefined
    this.cliUrl = undefined
    this.cliChecksum = undefined
    this.reload()
  }

  onGetState() {
    if (this.isCliLocal()) {
      this.refreshState()
      this.pushState()
    } else {
      console.log('getState ignored: cliLocal=false')
    }
  }

  async reload() {
    await this.stop()

    this.cliFilename = this.getCliFilename()
    this.cliUrl = this.getCliUrl()
    this.cliChecksum = this.getCliChecksum()

    this.state = {
      valid: undefined,
      started: undefined,
      status: undefined,
      info: undefined,
      error: undefined
    }
    this.refreshState()
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
    return this.getStoreOrSetDefault(STORE_CLI_FILENAME, CLI_FILENAME)
  }
  getCliUrl() {
    return this.getStoreOrSetDefault(STORE_CLI_URL, CLI_URL)
  }
  getCliChecksum() {
    return this.getStoreOrSetDefault(STORE_CLI_CHECKSUM, CLI_CHECKSUM)
  }
  isCliLocal() {
    return this.getStoreOrSetDefault(STORE_CLILOCAL, DEFAULT_CLI_LOCAL)
  }
  getCliServer() {
    return this.isCliLocal() ? 'LOCAL_TEST' : 'TEST'
  }

  refreshState(downloadIfMissing=true) {
    console.log('CliLocal: refreshState')
    this.state.valid = this.verifyChecksum()
    if (!this.state.valid) {
      if (this.state.started) {
        this.stop()
      }
      if (downloadIfMissing) {
        if (this.state.status === CLILOCAL_STATUS.DOWNLOADING || this.state.status === CLILOCAL_STATUS.ERROR) {
          console.log('refreshState: download skipped, status='+this.state.status+')')
          return
        }
        // download
        this.download(url).then(() => {
          console.log('CliLocal: download success!')
          this.state.info = undefined
          this.state.error = undefined
          this.refreshState(false)
        }).catch(e => {
          console.error('CliLocal: Download error', e)
          this.state.info = undefined
          this.state.error = 'Download error'
          this.updateState(CLILOCAL_STATUS.ERROR)
        })
      } else {
        this.updateState(CLILOCAL_STATUS.ERROR)
        this.state.info = undefined
        this.state.error = 'Could not download CLI'
      }
    } else {
      this.updateState(CLILOCAL_STATUS.READY)
      if (!this.state.started) {
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
    console.log('CliLocal: starting...')
    this.state.started = new Date().getTime()

    // start proc
    const server = this.getCliServer()
    const args = ['-jar', this.dlPath+'/'+this.cliFilename, '--listen', '--debug', '--server='+server, '--pool=0.01btc']
    const cmd = 'java'
    const logFile = getLogFile(app)
    this.startProc(cmd, args, logFile)
  }

  startProc(cmd, args, logFile) {
    const log = fs.createWriteStream(logFile, {flags: 'a'})

    const cmdStr = cmd+' '+args.join(' ')
    console.log('cliLocal: exec '+cmdStr)
    console.log('Log: '+logFile)
    log.write('=> Starting: '+cmdStr+'\n')
    this.cliProc = spawn(cmd, args)
    this.cliProc.on('error', function( err ) {
      console.error('cli error:', err)
      log.write('=> Error: '+err+'\n')
    })
    this.cliProc.on('exit', (code) => {
      // finishing
      console.log('cliLocal exiting...',code)
      log.write('=> Exit\n')
      this.state.started = false
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

  async stop() {
    if (!this.state.started) {
      console.error("CliLocal: stop skipped: not started")
      return
    }

    this.state.started = false

    if (this.cliProc) {
      this.cliProc.stdout.pause()
      this.cliProc.stderr.pause()
      this.cliProc.kill()
      await sleep(2000)
    }
  }

  verifyChecksum() {
    const dlPathFile = this.dlPath+'/'+this.cliFilename
    try {
      const md5sum = md5ify(dlPathFile)
      if (md5sum !== this.cliChecksum) {
        console.log('CliLocal: md5 mismatch: ' + md5sum + ' vs ' + this.cliChecksum)
        return false;
      }
    } catch(e) {
      return false;
    }
    return true
  }

  download(url) {
    this.updateState(CLILOCAL_STATUS.DOWNLOADING)
    const win = BrowserWindow.getFocusedWindow();

    const onProgress = progress => {
      this.updateState(CLILOCAL_STATUS.DOWNLOADING, 'Progress: '+progress)
    }
    return download(win, url, {directory: this.dlPath, onProgress: onProgress})
  }

  updateState(status, info=undefined, error=undefined) {
    this.state = {
      valid: this.state.valid,
      started: this.state.started,
      status: status,
      info: info,
      error: error,
    }
    this.pushState()
  }

  pushState () {
    console.log('cliLocal: pushState',this.state)
    this.window.send(IPC_CLILOCAL.STATE, this.state)
  }
}

