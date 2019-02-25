import utils from './utils';
import status from './status';

const HOST = 'http://127.0.0.1:8899'
const API_VERSION = '0.4'
const HEADER_API_VERSION = 'apiVersion'

class BackendService {
  constructor () {
    this.dispatch = undefined
  }

  init (dispatch) {
    this.dispatch = dispatch
  }

  computeHeaders () {
    const headers = {
      'Content-Type': 'application/json'
    }
    headers[HEADER_API_VERSION] = API_VERSION
    return headers
  }

  fetchBackend (url, method, jsonBody=undefined, parseJson=false) {
    return utils.fetch(HOST + url, {
      method,
      headers: this.computeHeaders(),
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined
    }, parseJson)
  }

  fetchBackendAsJson (url, method, jsonBody=undefined) {
    return this.fetchBackend(url, method, jsonBody, true)
  }

  withStatus (mainLabel, label, executor, itemId) {
    console.log(`=> req backend: ${mainLabel}: ${label}`)
    return status.executeWithStatus(
      mainLabel,
      label,
      executor,
      this.dispatch,
      itemId
    )
  }

  pools = {
    fetchPools: () => {
      return this.withStatus('Pools', 'Fetch pools', () =>
          this.fetchBackendAsJson('/rest/pools', 'GET')
        , 'pools.fetchPools')
    }
  };

  wallet = {
    fetchUtxos: () => {
      return this.withStatus('Wallet', 'Fetch utxos', () =>
        this.fetchBackendAsJson('/rest/utxos', 'GET')
        , 'wallet.fetchUtxos')
    },

    fetchDeposit: (increment) => {
      return this.withStatus('Wallet', 'Fetch deposit address', () =>
        this.fetchBackendAsJson('/rest/wallet/deposit?increment='+increment, 'GET')
        , 'wallet.fetchDeposit')
    }
  };

  mix = {
    fetchState: () => {
      return this.withStatus('Mix', 'Fetch state', () =>
        this.fetchBackendAsJson('/rest/mix', 'GET')
        , 'mix.fetchState')
    },
    start: () => {
      return this.withStatus('Mix', 'Start mixing', () =>
        this.fetchBackendAsJson('/rest/mix/start', 'POST')
        , 'mix.start')
    },
    stop: () => {
      return this.withStatus('Mix', 'Stop mixing', () =>
        this.fetchBackendAsJson('/rest/mix/stop', 'POST')
        , 'mix.stop')
    }
  };

  utxo = {
    startMix: (hash, index) => {
      return this.withStatus('Utxo', 'Start mixing', () =>
        this.fetchBackendAsJson('/rest/utxos/'+hash+':'+index+'/startMix', 'POST')
      )
    },
    stopMix: (hash, index) => {
      return this.withStatus('Utxo', 'Stop mixing', () =>
        this.fetchBackendAsJson('/rest/utxos/'+hash+':'+index+'/stopMix', 'POST')
      )
    },
    tx0: (hash, index, poolId, mixsTarget) => {
      return this.withStatus('Utxo', 'Tx0', () =>
        this.fetchBackendAsJson('/rest/utxos/'+hash+':'+index+'/tx0', 'POST', {
          poolId: poolId,
          mixsTarget: mixsTarget
        })
      )
    },
  }
}
const backendService = new BackendService()
export default backendService
