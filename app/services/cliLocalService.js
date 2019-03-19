import { ipcRenderer } from 'electron';
import { CLILOCAL_STATUS, IPC_CLILOCAL } from '../mainProcess/cliLocal';
import cliService from './cliService';

class CliLocalService {
  constructor() {
    this.state = undefined
    ipcRenderer.on(IPC_CLILOCAL.STATE, this.onState.bind(this))
  }

  onState(event, cliLocalState) {
    console.log('cliLocalService.onState', cliLocalState)
    this.state = cliLocalState
    cliService.setCliLocalState(cliLocalState)
  }

  fetchState() {
    console.log('CliLocalService: fetchState')
    ipcRenderer.send(IPC_CLILOCAL.GET_STATE)
  }

  reload() {
    console.log('CliLocalService: reload')
    ipcRenderer.send(IPC_CLILOCAL.RELOAD)
  }

  isValid() {
    return this.state !== undefined && this.state.valid
  }

  getInfo() {
    return this.state !== undefined && this.state.info
  }

  getError() {
    return this.state !== undefined && this.state.error
  }

  isStatusDownloading() {
    return this.state !== undefined && this.state.status === CLILOCAL_STATUS.DOWNLOADING
  }

  isStarted() {
    return this.state !== undefined && this.state.started
  }

  getStartTime() {
    return this.state ? this.state.started : undefined
  }

  isStatusError() {
    return this.state !== undefined && this.state.status === CLILOCAL_STATUS.ERROR
  }

}
export const cliLocalService = new CliLocalService()

