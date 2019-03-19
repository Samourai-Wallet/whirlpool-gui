import ifNot from 'if-not-running';
import Store from 'electron-store';
import backendService from './backendService';
import { CLI_STATUS } from './utils';
import mixService from './mixService';
import walletService from './walletService';
import poolsService from './poolsService';
import { CLI_URL_LOCAL } from '../containers/InitPage';
import { cliLocalService } from './cliLocalService';

const STORE_CLIURL = "cli.url"
const STORE_APIKEY = "cli.apiKey"

const REFRESH_RATE = 15000;
class CliService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
    this.servicesStarted = false

    this.cliUrl = undefined
    this.apiKey = undefined
    this.store = new Store()
  }

  init (state, setState) {
    this.loadConfig()

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
    return this.cliUrl === CLI_URL_LOCAL
  }

  // cli API

  getCliUrl() {
    return this.cliUrl
  }

  getApiKey() {
    return this.apiKey
  }

  testCliUrl(cliUrl, apiKey) {
    return backendService.cli.fetchState(cliUrl, apiKey).then(cliState => {
      return cliState.cliStatus === CLI_STATUS.READY
    })
  }

  initializeCli(cliUrl, apiKey, encryptedSeedWords) {
    return backendService.cli.init(cliUrl, apiKey, encryptedSeedWords).then(result => {
      const apiKey = result.apiKey

      // save configuration
      this.saveConfig(cliUrl, apiKey)
    })
  }

  loadConfig() {
    this.cliUrl = this.store.get(STORE_CLIURL)
    this.apiKey = this.store.get(STORE_APIKEY)
    console.log('cliService.loadConfig: cliUrl='+this.cliUrl)
  }

  saveConfig(cliUrl, apiKey) {
    this.store.set(STORE_CLIURL, cliUrl)
    this.store.set(STORE_APIKEY, apiKey)

    this.cliUrl = cliUrl
    this.apiKey = apiKey

    this.start()
  }

  resetConfig() {
    this.store.delete(STORE_CLIURL)
    this.store.delete(STORE_APIKEY)

    this.cliUrl = undefined
    this.apiKey = undefined

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

  isCliStatusReady() {
    return this.isConnected() && this.state.cli.cliStatus === CLI_STATUS.READY
  }

  isCliStatusNotInitialized() {
    return this.isConnected() && this.state.cli.cliStatus === CLI_STATUS.NOT_INITIALIZED
  }

  isLoggedIn() {
    return this.isCliStatusReady() && this.state.cli.loggedIn
  }

  setCliLocalState(cliLocalState) {
    this.updateState({cliLocalState: cliLocalState})
  }

  fetchState () {
    if (!this.isConfigured()) {
      return Promise.reject("not configured")
    }
    cliLocalService.fetchState()
    if (this.isCliLocal()) {
      if (!cliLocalService.isStarted()) {
        return Promise.reject("local CLI not started yet")
      }
    }
    return ifNot.run('cliService:fetchState', () => {
      // fetchState backend
      return backendService.cli.fetchState().then(cliState => {
        this.updateState({
          cli: cliState,
          cliUrlError: undefined
        })

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
}

const cliService = new CliService()
export default cliService
