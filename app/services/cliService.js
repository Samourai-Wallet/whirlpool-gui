import ifNot from 'if-not-running';
import Store from'electron-store';
import backendService from './backendService';
import { CLI_STATUS } from './utils';
import mixService from './mixService';
import walletService from './walletService';
import poolsService from './poolsService';

const STORE_CLIURL = "cli.url"
const STORE_APIKEY = "cli.apiKey"

class CliService {
  constructor () {
    this.setState = undefined
    this.state = undefined
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
    return this.fetchState().then(() => {
      console.log('cliService.start, cliStatus='+this.getCliStatus())
      if (this.isLoggedIn()) {
        mixService.start()
        walletService.start()
        poolsService.start()
      }
    })
  }

  stop() {
    mixService.stop()
    walletService.stop()
    poolsService.stop()
  }

  isReady() {
    return this.state && this.state.cli
  }

  isConfigured() {
    return this.cliUrl && this.apiKey
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

    this.pushState() // force refresh
  }

  login(seedPassphrase) {
    return backendService.cli.login(seedPassphrase).then(cliState => {
      this.setState(cliState)
    })
  }

  logout() {
    return backendService.cli.logout().then(cliState => {
      this.setState(cliState)
    })
  }

  // state

  getCliUrlError() {
    return this.state ? this.state.cliUrlError : undefined
  }

  getCliStatus() {
    if (!this.isReady()) {
      return undefined
    }
    return this.state.cli.cliStatus;
  }

  isCliStatusReady() {
    return this.isReady() && this.state.cli.cliStatus === CLI_STATUS.READY
  }

  isLoggedIn() {
    return this.isCliStatusReady() && this.state.cli.loggedIn
  }

  fetchState () {
    if (!this.isConfigured()) {
      return Promise.reject("not configured")
    }
    return ifNot.run('cliService:fetchState', () => {
      // fetchState backend
      return backendService.cli.fetchState().then(cliState => {
        this.setState(cliState)
      }).catch(e => {
        this.state = {
          cliUrlError: e.message
        }
        this.pushState()
      })
    })
  }

  setState(cli) {
    // set state
    if (this.state === undefined) {
      console.log('cliService: initializing new state')
      this.state = {
        cli: cli,
        cliUrlError: undefined
      }
    } else {
      // new state object
      const currentState = Object.assign({}, this.state)
      console.log('cliService: updating existing state', currentState)
      currentState.cli = cli
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
