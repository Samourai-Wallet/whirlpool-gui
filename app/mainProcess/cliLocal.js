import { BrowserWindow } from 'electron';
import {download} from 'electron-dl';
import md5ify from 'md5ify'

export const IPC_CLILOCAL = {
  INIT: 'cliLocal.init',
  START: 'cliLocal.start',
  STATE: 'cliLocal.state'
}
export const CLILOCAL_STATUS = {
  READY: 'READY',
  DOWNLOADING: 'DOWNLOADING',
  ERROR: 'ERROR',
  STARTED: 'STARTED',
}
export class CliLocal {

  constructor(ipcMain, dlPath, window) {
    this.ipcMain = ipcMain
    this.dlPath = dlPath
    this.window = window

    this.state = undefined
    this.cliFilename = undefined

    this.ipcMain.on(IPC_CLILOCAL.INIT, (event, {filename, url, md5}) => {
      this.onInit(filename, url, md5)
    });

    this.ipcMain.on(IPC_CLILOCAL.START, () => {
      this.onStart()
    });
  }

  onInit(cliFilename, url, md5, downloadIfMissing=true) {
    if (this.state !== undefined) {
      console.log('CliLocal: onInit skipped, already initializing')
      return
    }
    console.log('CliLocal: onInit',cliFilename, url)
    this.cliFilename = cliFilename
    const valid = this.checkMd5(md5)
    if (valid) {
      // already exists
      this.updateState(CLILOCAL_STATUS.READY)
    } else {
      if (downloadIfMissing) {
        // download
        this.download(url).then(() => {
          console.log('CliLocal: download success!')

          this.onInit(cliFilename, url, md5, false)
        }).catch(e => {
          console.error('CliLocal: Download error', e)
          this.updateState(CLILOCAL_STATUS.ERROR, 'Download error')
        })
      } else {
        this.updateState(CLILOCAL_STATUS.ERROR, 'Could not download CLI')
      }
    }
  }

  isReady() {
    return this.state && this.state.status === CLILOCAL_STATUS.READY
  }

  onStart() {
    if (!this.isReady()) {
      console.error("CliLocal: onStart skipped: not ready")
      return
    }

    console.log('CliLocal: onStart')

    const args = "--listen --debug --network=test --pool=0.01btc --server=localhost:8081"
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
    console.log('cliLocal started...')
    backendProc.on('exit', (code, sig) => {
      // finishing
      console.log('cliLocal exiting...')
    })
    backendProc.on('error', (error) => {
      // error handling
      console.log('cliLocal error...')
    })
  }

  checkMd5(md5Expected) {
    const dlPathFile = this.dlPath+'/'+this.cliFilename
    try {
      const md5sum = md5ify(dlPathFile)
      if (md5sum !== md5Expected) {
        console.log('CliLocal: md5 mismatch: ' + md5sum + ' vs ' + md5Expected)
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

