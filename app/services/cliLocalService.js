import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ProgressBar } from 'react-bootstrap';
import { CLILOCAL_STATUS, IPC_CLILOCAL } from '../const';
import cliService from './cliService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

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

  deleteConfig() {
    console.log('CliLocalService: reset local CLI')
    ipcRenderer.send(IPC_CLILOCAL.DELETE_CONFIG)
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

  getProgress() {
    return this.state !== undefined && this.state.progress
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

  getStatusIcon(format) {
    let infoError = ""
    if (cliLocalService.getError()) {
      infoError = cliLocalService.getError()+'. '
    }
    if (cliLocalService.getInfo()) {
      infoError += cliLocalService.getInfo()
    }

    // downloading
    if (cliLocalService.isStatusDownloading()) {
      const progress = this.getProgress()
      const status = 'CLI '+cliLocalService.getCliVersionStr()+' is being downloaded... '+(progress?progress+'%':'')
      const progressBar = progress ? <ProgressBar animated now={progress} label={progress+'%'} title={status}/> : <span></span>
      return format(progressBar, status)
    }
    // error
    if (cliLocalService.isStatusError()) {
      const status = 'CLI error: '+infoError
      return format(<FontAwesomeIcon icon={Icons.faCircle} color='red' title={status}/>, status)
    }
    if (cliLocalService.isStarted()) {
      // started
      const status = 'CLI running for '+moment.duration(new Date().getTime()-cliLocalService.getStartTime()).humanize()
      return format(<FontAwesomeIcon icon={Icons.faPlay} color='green' title={status} size='xs'/>, status)
    }
    if (!cliLocalService.isValid()) {
      // invalid
      const status = 'CLI executable is not valid. '+infoError
      return format(<FontAwesomeIcon icon={Icons.faCircle} color='red' title={status} size='xs'/>, status)
    }
    // valid but stopped
    const status = 'CLI is not running. '+infoError
    return format(<FontAwesomeIcon icon={Icons.faStop} color='orange' title={status} />, status)
  }

  hasCliApi() {
    return this.state && this.state.cliApi
  }

  getCliVersion() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.cliVersion
  }

  getCliVersionStr() {
    return this.getCliVersion() ? this.getCliVersion() : '?'
  }

  getCliFilename() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.filename
  }

  getCliUrl() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.url
  }

  getCliChecksum() {
    if (!this.hasCliApi()) {
      return undefined
    }
    return this.state.cliApi.cliChecksum
  }
}
export const cliLocalService = new CliLocalService()

