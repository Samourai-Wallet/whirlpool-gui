import ifNot from 'if-not-running';
import moment from 'moment';
import backendService from './backendService';
import { TX0_MIN_CONFIRMATIONS, WHIRLPOOL_ACCOUNTS } from './utils';
import poolsService from './poolsService';
import walletService from './walletService';

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

  isReady() {
    return this.state && this.state.mix
  }

  // controls global

  start() {
    return backendService.mix.start().then(() => this.fetchState())
  }

  stop() {
    return backendService.mix.stop().then(() => this.fetchState())
  }

  // controls utxo

  getPoolsForTx0(utxo) {
    return poolsService.getPoolsForTx0(utxo.value)
  }

  isTx0Possible(utxo) {
    return (utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT || utxo.account === WHIRLPOOL_ACCOUNTS.PREMIX)
      && (utxo.status === 'READY' || utxo.status === 'TX0_FAILED')
      && utxo.confirmations >= TX0_MIN_CONFIRMATIONS
      && this.getPoolsForTx0(utxo).length > 0
  }

  tx0(utxo, poolId, mixsTarget) {
    return backendService.utxo.tx0(utxo.hash, utxo.index, poolId, mixsTarget).then(() => walletService.fetchState())
  }

  startMix(utxo) {
    return backendService.utxo.startMix(utxo.hash, utxo.index).then(() => Promise.all(walletService.fetchState(), this.fetchState()))
  }

  stopMix(utxo) {
    return backendService.utxo.stopMix(utxo.hash, utxo.index).then(() => Promise.all(walletService.fetchState(), this.fetchState()))
  }

  getPoolsForMix(utxo) {
    return poolsService.getPoolsForMix(utxo.value)
  }

  isStartMixPossible(utxo) {
    return (utxo.account === WHIRLPOOL_ACCOUNTS.PREMIX || utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX)
      && (utxo.status === 'MIX_FAILED' || utxo.status === 'READY')
      && this.getPoolsForMix(utxo).length > 0
  }

  isStopMixPossible(utxo) {
    return (utxo.account === WHIRLPOOL_ACCOUNTS.PREMIX || utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX)
      && (utxo.status === 'MIX_QUEUE' || utxo.status === 'MIX_STARTED' || utxo.status === 'MIX_SUCCESS')
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
