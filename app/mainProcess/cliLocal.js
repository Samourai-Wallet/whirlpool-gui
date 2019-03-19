import { BrowserWindow, ipcRenderer } from 'electron';
import {download} from 'electron-dl';
import md5ify from 'md5ify'
import { exec } from 'child_process'
import Store from 'electron-store';

export const IPC_CLILOCAL = {
  GET_STATE: 'cliLocal.getState',
  STATE: 'cliLocal.state',
  RELOAD: 'cliLocal.reload'
}
export const CLILOCAL_STATUS = {
  DOWNLOADING: 'DOWNLOADING',
  ERROR: 'ERROR',
  READY: 'READY'
}
const CLI_FILENAME = "whirlpool-client-cli-develop-SNAPSHOT-run.jar";
const CLI_URL = "https://file.io/7G4siX";
const CLI_CHECKSUM = "4d5152a5b564cd3473be1874e0965044";

const STORE_CLI_FILENAME = 'CLI_FILENAME'
const STORE_CLI_URL = 'CLI_URL'
const STORE_CLI_CHECKSUM = 'CLI_CHECKSUM'
export class CliLocal {

  constructor(ipcMain, dlPath, window) {
    this.ipcMain = ipcMain
    this.dlPath = dlPath
    this.window = window
    this.store = new Store()

    this.ipcMain.on(IPC_CLILOCAL.RELOAD, this.reload.bind(this))
    this.ipcMain.on(IPC_CLILOCAL.GET_STATE, this.onGetState.bind(this));

    this.cliFilename = undefined
    this.cliUrl = undefined
    this.cliChecksum = undefined
    this.reload()
  }

  onGetState() {
    this.refreshState()
    this.pushState()
  }

  reload() {
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
    this.state.started = true

    const args = "--listen --debug --server=LOCAL_TEST --pool=0.01btc"
    const cmd = 'java -jar '+this.dlPath+'/'+this.cliFilename+' '+args
    console.log('cliLocal: exec '+cmd)
    const backendProc = exec(cmd, undefined,
      (error, stdout, stderr) => {
        console.log('cliLocal stdout: ' + stdout);
        console.log('cliLocal stderr: ' + stderr);
        if(error !== null){
          console.log('cliLocal exec error: ' + error);
        }
      }
    )
    backendProc.on('exit', (code, sig) => {
      // finishing
      console.log('cliLocal exiting...',code,sig)
      this.state.started = false
    })
    backendProc.on('error', (error) => {
      // error handling
      console.log('cliLocal error...',error)
    })
  }

  stop() {
    if (!this.state.started) {
      console.error("CliLocal: stop skipped: not started")
      return
    }

    // TODO
    this.state.started = false
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

