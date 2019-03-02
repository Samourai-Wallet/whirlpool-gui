import ifNot from 'if-not-running';
import moment from 'moment';
import backendService from './backendService';

const REFRESH_RATE = 60000;
class PoolsService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('poolsService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('poolsState: init...')
        if (state !== undefined) {
          console.log('poolsState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('poolsState: already initialized')
      }
    })
    if (this.refreshTimeout === undefined) {
      this.fetchState()
      this.refreshTimeout = setInterval(this.fetchState.bind(this), REFRESH_RATE)
    }
  }

  isReady() {
    return this.state && this.state.pools
  }

  // pools

  getPools () {
    return this.state.pools.pools;
  }

  getPoolsForTx0(utxoBalance) {
    return this.getPools().filter(pool => utxoBalance >= pool.tx0BalanceMin)
  }

  getPoolsForMix(utxoBalance, liquidity) {
    if (liquidity) {
      return this.getPools().filter(pool => utxoBalance == pool.denomination)
    }
    return this.getPools().filter(pool => utxoBalance >= pool.mustMixBalanceMin && utxoBalance <= pool.mustMixBalanceMax)
  }

  fetchState () {
    return ifNot.run('poolsService:fetchState', () => {
      // fetchState backend
      return backendService.pools.fetchPools().then(pools => {
        // set state
        if (this.state === undefined) {
          console.log('poolsService: initializing new state')
          this.state = {
            pools: pools
          }
        } else {
          console.log('poolsService: updating existing state', Object.assign({}, this.state))
          this.state.pools = pools
        }
        this.pushState()
      })
    })
  }

  pushState () {
    this.setState(this.state)
  }
}

const poolsService = new PoolsService()
export default poolsService
