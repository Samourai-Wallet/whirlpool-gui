import { ipcRenderer } from 'electron';
import {
  CLILOCAL_STATUS,
  IPC_CLILOCAL
} from '../mainProcess/cliLocal';

const CLI_DOWNLOAD_FILENAME = "whirlpool-client-cli-develop-SNAPSHOT-run.jar";
const CLI_DOWNLOAD_URL = "https://file.io/7G4siX";
const CLI_DOWNLOAD_MD5 = "4d5152a5b564cd3473be1874e0965044";
class CliLocalService {
  constructor() {
    this.state = undefined

    ipcRenderer.on(IPC_CLILOCAL.STATE, function(event, cliLocalState){
      console.log('cliLocalService.state', cliLocalState)
      this.state = cliLocalState
    })

    // init
    console.log('CliLocalService: init...')
    ipcRenderer.send(IPC_CLILOCAL.INIT, {filename:CLI_DOWNLOAD_FILENAME, url:CLI_DOWNLOAD_URL, md5: CLI_DOWNLOAD_MD5})
  }

  start() {
    if (this.isStarted()) {
      // already started
      console.log('CliLocalService: start skipped, already started')
      return
    }
    if (!this.isReady()) {
      // not ready
      console.log('CliLocalService: start skipped, not ready')
      return
    }
    console.log('CliLocalService: start')
    ipcRenderer.send(IPC_CLILOCAL.START)
  }

  isReady() {
    return this.state !== undefined && this.state.status === CLILOCAL_STATUS.READY
  }

  isStarted() {
    return this.state !== undefined && this.state.status === CLILOCAL_STATUS.STARTED
  }

  getStatus() {
    return this.state ? this.state.status : undefined
  }

}
export const cliLocalService = new CliLocalService()

