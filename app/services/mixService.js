import ifNot from 'if-not-running';
import moment from 'moment';
import backendService from './backendService';

const REFRESH_RATE = 3000;
class MixService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('mixService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('mixState: init...')
        if (state !== undefined) {
          console.log('mixState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('mixState: already initialized')
      }
    })
    if (this.refreshTimeout === undefined) {
      this.fetchState()
      this.refreshTimeout = setInterval(this.fetchState.bind(this), REFRESH_RATE)
    }
  }

  // controls

  start() {
    backendService.mix.start().then(() => this.fetchState())
  }

  stop() {
    backendService.mix.stop().then(() => this.fetchState())
  }

  // state

  computeLastActivity(utxo) {
    if (!utxo.lastActivityElapsed) {
      return undefined
    }
    const fetchElapsed = new Date().getTime()-this.state.mix.fetchTime
    return moment.duration(fetchElapsed + utxo.lastActivityElapsed).humanize()
  }

  isStarted () {
    return this.state.mix.started;
  }

  getNbMixing() {
    return this.state.mix.nbMixing;
  }

  getMaxClients() {
    return this.state.mix.maxClients;
  }

  getNbIdle() {
    return this.state.mix.nbIdle;
  }

  getNbQueued() {
    return this.state.mix.nbQueued;
  }

  getThreads() {
    return this.state.mix.threads;
  }

  fetchState () {
    return ifNot.run('mixService:fetchState', () => {
      // fetchState backend
      return backendService.mix.fetchState().then(mix => {
        mix.fetchTime = new Date().getTime()
        // set state
        if (this.state === undefined) {
          console.log('mixService: initializing new state')
          this.state = {
            mix: mix
          }
        } else {
          // new state object
          const currentState = Object.assign({}, this.state)
          console.log('mixService: updating existing state', currentState)
          currentState.mix = mix
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

const mixService = new MixService()
export default mixService
