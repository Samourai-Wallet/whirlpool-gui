import ifNot from 'if-not-running';
import backendService from './backendService';
import { CLI_STATUS } from './utils';
import mixService from './mixService';
import walletService from './walletService';
import poolsService from './poolsService';

class CliService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.cliUrl = undefined
    this.apiKey = undefined
  }

  init (state, setState, cliUrl, apiKey) {
    this.cliUrl = cliUrl
    this.apiKey = apiKey

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
      if (this.isCliStatusReady()) {
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

  // cli API

  getCliUrl() {
    return this.cliUrl
  }

  getApiKey() {
    return this.apiKey
  }

  testCliUrl(cliUrl) {
    return backendService.cli.fetchState(cliUrl)
  }

  initializeCli(cliUrl, encryptedSeedWords) {
    return backendService.cli.init(cliUrl, encryptedSeedWords).then(result => {
      const apiKey = result.apiKey

      // save configuration
      this.saveConfig(cliUrl, apiKey)
    })
  }

  saveConfig(cliUrl, apiKey) {
    console.log('**** saveConfig', cliUrl, apiKey)
  }

  aaa(cliUrl) {
    const wasStarted = this.isCliStatusReady()

    // stop all services
    this.stop()

    // set url
    this.cliUrl = cliUrl

    // test

    // restart services
  }

  // state

  getCliStatus() {
    return this.state.cli.cliStatus;
  }

  isCliStatusReady() {
    return this.isReady() && this.state.cli.cliStatus === CLI_STATUS.READY
  }

  fetchState () {
    return ifNot.run('cliService:fetchState', () => {
      // fetchState backend
      return backendService.cli.fetchState().then(cli => {
        // set state
        if (this.state === undefined) {
          console.log('cliService: initializing new state')
          this.state = {
            cli: cli
          }
        } else {
          // new state object
          const currentState = Object.assign({}, this.state)
          console.log('cliService: updating existing state', currentState)
          currentState.cli = cli
          this.state = currentState
        }
        this.pushState()
      })
    })
  }

  pushState () {
    this.setState(this.state)
  }
}

const cliService = new CliService()
export default cliService
