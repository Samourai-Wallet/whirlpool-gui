import utils from './utils';
import status from './status';

const HOST = 'http://127.0.0.1:8899'
const API_VERSION = '0.5'
const API_KEY = 'foo'
const HEADER_API_VERSION = 'apiVersion'
const HEADER_API_KEY = 'apiKey'

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
    headers[HEADER_API_KEY] = API_KEY
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

  cli = {
    status: () => {
      return this.withStatus('CLI', 'Fetch status', () =>
          this.fetchBackendAsJson('/rest/cli', 'GET')
        , 'cli.status')
    },
    init: (encryptedSeedWords) => {
      return this.withStatus('CLI', 'Initialize', () =>
        this.fetchBackendAsJson('/rest/cli/init', 'POST', {
          encryptedSeedWords: encryptedSeedWords
        })
        , 'cli.init')
    }
  };

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
        this.fetchBackend('/rest/mix/start', 'POST')
        , 'mix.start')
    },
    stop: () => {
      return this.withStatus('Mix', 'Stop mixing', () =>
        this.fetchBackend('/rest/mix/stop', 'POST')
        , 'mix.stop')
    }
  };

  utxo = {
    tx0: (hash, index) => {
      return this.withStatus('Utxo', 'Tx0', () =>
        this.fetchBackendAsJson('/rest/utxos/'+hash+':'+index+'/tx0', 'POST')
      )
    },
    configure: (hash, index, poolId, mixsTarget) => {
      return this.withStatus('Utxo', 'Tx0', () =>
        this.fetchBackendAsJson('/rest/utxos/'+hash+':'+index, 'POST', {
          poolId: poolId,
          mixsTarget: mixsTarget
        })
      )
    },
    startMix: (hash, index) => {
      return this.withStatus('Utxo', 'Start mixing', () =>
        this.fetchBackend('/rest/utxos/'+hash+':'+index+'/startMix', 'POST')
      )
    },
    stopMix: (hash, index) => {
      return this.withStatus('Utxo', 'Stop mixing', () =>
        this.fetchBackend('/rest/utxos/'+hash+':'+index+'/stopMix', 'POST')
      )
    },
  }
}
const backendService = new BackendService()
export default backendService
