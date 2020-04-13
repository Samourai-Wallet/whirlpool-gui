import * as React from 'react';
import ifNot from 'if-not-running';
import { logger } from '../utils/logger';
import backendService from './backendService';
import utils, { CLI_STATUS } from './utils';
import mixService from './mixService';
import walletService from './walletService';
import poolsService from './poolsService';
import { cliLocalService } from './cliLocalService';
import { DEFAULT_CLI_LOCAL } from '../const';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import guiUpdateService from './guiUpdateService';
import routes from '../constants/routes';
import { Link } from 'react-router-dom';
import guiConfig from '../mainProcess/guiConfig';

const REFRESH_RATE = 6000;
class CliService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
    this.servicesStarted = false

    this.cliUrl = undefined
    this.apiKey = undefined
    this.cliLocal = undefined

    this.loadConfig()
  }

  init (state, setState) {
    ifNot.run('cliService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('cliState: init...')
        if (state !== undefined) {
          console.log('cliState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('cliState: already initialized')
      }
    })
  }

  start() {
    if (this.refreshTimeout === undefined) {
      this.refreshTimeout = setInterval(this.fetchState.bind(this), REFRESH_RATE)
      return this.fetchState()
    }
  }

  startServices() {
    if (!this.servicesStarted) {
      this.servicesStarted = true
      mixService.start()
      walletService.start()
      poolsService.start()
    }
  }

  stopServices() {
    if (this.servicesStarted) {
      this.servicesStarted = false
      mixService.stop()
      walletService.stop()
      poolsService.stop()
    }
  }

  isConnected() {
    return this.state && this.state.cli
  }

  isConfigured() {
    return this.cliUrl && this.apiKey
  }

  isCliLocal() {
    return this.cliLocal
  }

  // cli API

  getCliUrl() {
    return this.cliUrl
  }

  getApiKey() {
    return this.apiKey
  }

  testCliUrl(cliUrl, apiKey) {
    return this.doFetchState(cliUrl, apiKey).then(cliState => {
      return cliState.cliStatus === CLI_STATUS.READY
    })
  }

  fetchStateError(error) {
    if (error.message === 'Failed to fetch') {
      error = Error('Could not connect to CLI (may take a few seconds to start...)')
    }
    return error
  }

  initializeCli(cliUrl, apiKey, cliLocal, pairingPayload, tor, dojo) {
    return backendService.cli.init(cliUrl, apiKey, pairingPayload, tor, dojo).then(result => {
      const apiKey = result.apiKey

      // save configuration
      this.saveConfig(cliUrl, apiKey, cliLocal)
    })
  }

  saveConfig(cliUrl, apiKey, cliLocal) {
    this.cliUrl = cliUrl
    this.apiKey = apiKey

    guiConfig.setCliUrl(cliUrl)
    guiConfig.setCliApiKey(apiKey)

    this.setCliLocal(cliLocal)
    this.start()
  }

  loadConfig() {
    this.cliUrl = guiConfig.getCliUrl()
    this.apiKey = guiConfig.getCliApiKey()
    this.cliLocal = guiConfig.getCliLocal()
    console.log('cliService.loadConfig: cliUrl='+this.cliUrl)

    if (!this.isConfigured()) {
      logger.info('cliService is not configured.')
      this.setCliLocal(DEFAULT_CLI_LOCAL)
    }
  }

  setCliLocal(cliLocal) {
    logger.info("cliService.setCliLocal: "+cliLocal)
    this.cliLocal = cliLocal
    guiConfig.setCliLocal(cliLocal)
    if (!cliLocal) {
      cliLocalService.deleteConfig()
    }
    cliLocalService.reload()
  }

  getResetLabel() {
    let resetLabel = 'GUI'
    if (this.isCliLocal()) {
      resetLabel += ' + CLI configuration'
    }
    return resetLabel
  }

  resetConfig() {
    if (this.isCliLocal()) {
      // reset CLI first
      cliLocalService.deleteConfig()
    }
    this.doResetGUIConfig()
  }

  doResetGUIConfig() {

    // reset GUI
    guiConfig.resetCliConfig()

    this.cliUrl = undefined
    this.apiKey = undefined
    this.setCliLocal(DEFAULT_CLI_LOCAL)

    // force refresh
    this.updateState({
      cli: undefined,
      cliUrlError: undefined,
      cliLocalState: undefined
    })

    cliLocalService.reload()
  }

  login(seedPassphrase) {
    return backendService.cli.login(seedPassphrase).then(cliState => {
      this.updateState({
        cli: cliState,
        cliUrlError: undefined
      })
    })
  }

  logout() {
    return backendService.cli.logout().then(cliState => {
      this.updateState({
        cli: cliState,
        cliUrlError: undefined
      })
    })
  }

  // state

  getCliUrlError() {
    return this.state ? this.state.cliUrlError : undefined
  }

  getCliStatus() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.cliStatus;
  }

  getCliMessage() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.cliMessage;
  }

  getNetwork() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.network;
  }

  getServerUrl() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.serverUrl;
  }

  getServerName() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.serverName;
  }

  isTor() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.tor;
  }

  isDojo() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.dojo;
  }

  isDojoPossible() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.getDojoUrl() ? true : false
  }

  getDojoUrl() {
    if (!this.isConnected()) {
      return undefined
    }
    return this.state.cli.dojoUrl;
  }

  isTestnet() {
    return this.getNetwork() === 'test'
  }

  isCliStatusReady() {
    return this.isConnected() && this.state.cli.cliStatus === CLI_STATUS.READY
  }

  isCliStatusNotInitialized() {
    return this.isConnected() && this.state.cli.cliStatus === CLI_STATUS.NOT_INITIALIZED
  }

  isLoggedIn() {
    return this.isCliStatusReady() && this.state.cli.loggedIn
  }

  getTorProgress() {
    return this.isCliStatusReady() && this.state.cli.torProgress
  }

  getTorProgressIcon() {
    const torProgress = this.getTorProgress()
    if (!torProgress) {
      return undefined
    }
    const connected = torProgress === 100
    return <span className={'torIcon torIcon'+(cliService.isTor() ? (connected?'Connected':'Connecting'):'Disabled')} title={'Tor is '+(cliService.isTor() ?(connected?'CONNECTED':'CONNECTING '+torProgress+'%'):'DISABLED')}>
      {utils.torIcon()}
      {!connected && <span>{torProgress+'%'}</span>}
    </span>
  }

  getDojoIcon() {
    if (!this.isConnected() || !this.isDojo()) {
      return undefined
    }
    return <span className='dojoIcon' title={'DOJO is ENABLED: '+this.getDojoUrl()}><FontAwesomeIcon icon={Icons.faHdd} color='green'/></span>
  }

  setCliLocalState(cliLocalState) {
    const newState = {cliLocalState: cliLocalState}
    if (cliLocalState !== undefined && cliLocalState.error) {
      // forward local CLI error
      newState.cliUrlError = cliLocalState.error
    }
    this.updateState(newState)
  }

  doFetchState(cliUrl=undefined, apiKey=undefined)  {
    return backendService.cli.fetchState(cliUrl, apiKey).catch(e => {
      throw this.fetchStateError(e)
    })
  }

  fetchState () {
    if (this.isCliLocal()) {
      cliLocalService.fetchState()
      if (!cliLocalService.isStarted()) {
        return Promise.reject("local CLI not started yet")
      }
    }
    return ifNot.run('cliService:fetchState', () => {
      // fetchState backend
      return this.doFetchState().then(cliState => {
        this.updateState({
          cli: cliState,
          cliUrlError: undefined
        })

        // start guiUpdateService
        guiUpdateService.start()

        // notify services
        if (this.isLoggedIn()) {
          this.startServices()
        } else {
          this.stopServices()
        }
      }).catch(e => {
        // notify services
        this.updateState({
          cli: undefined,
          cliUrlError: e.message
        })
        this.stopServices()
      })
    })
  }

  updateState(newState) {
    // set state
    if (this.state === undefined) {
      console.log('cliService: initializing new state')
      this.state = newState
    } else {
      // new state object
      const currentState = Object.assign({}, this.state)
      console.log('cliService: updating existing state', currentState)
      for (const key in newState) {
        currentState[key] = newState[key]
      }
      this.state = currentState
    }
    this.pushState()
  }

  pushState () {
    this.setState(this.state)
  }

  getStatusIcon(format) {
    if (cliService.isCliStatusReady()) {
      // connected & ready
      const status = 'Connected to CLI'
      return format(<FontAwesomeIcon icon={Icons.faWifi} color='green' title={status} />, status)
    }
    if (cliService.getCliUrlError()) {
      // not connected
      const status = 'Disconnected from CLI'
      return format(<FontAwesomeIcon icon={Icons.faWifi} color='red' title={status} />, status)
    }
    // connected & initialization required
    if (cliService.isCliStatusNotInitialized()) {
      const status = 'Connected to CLI, initialization required'
      return format(<FontAwesomeIcon icon={Icons.faWifi} color='orange' title={status}/>, status)
    }
    // connected & not ready
    if (cliService.isConnected()) {
      let cliMessage = cliService.getCliMessage()
      if (!cliMessage) {
        cliMessage = 'starting...'
      }
      const status = 'Connected to CLI, which is not ready: '+cliMessage
      return format(<FontAwesomeIcon icon={Icons.faWifi} color='lightgreen' title={status}/>, status)
    }
  }

  getLoginStatusIcon(format) {
    if (cliService.isLoggedIn()) {
      // logged in
      const status = 'Wallet opened, click to logout'
      return format(<a href='#' title={status} onClick={()=>cliService.logout()} className='icon'><FontAwesomeIcon icon={Icons.faSignOutAlt} color='#CCC'/></a>, status)
    }

    const status = 'Wallet closed, click to login'
    return format(<Link to={routes.HOME} title={status} className='icon'><FontAwesomeIcon icon={Icons.faLock} color='#CCC' /></Link>, status)
  }
}

const cliService = new CliService()
export default cliService
