import utils from './utils';
import status from './status';
import cliService from './cliService';
import { API_VERSION, VERSIONS_URL } from '../const';

const HEADER_API_VERSION = 'apiVersion'
const HEADER_API_KEY = 'apiKey'

class BackendService {
  constructor () {
    this.dispatch = undefined
  }

  init (dispatch) {
    this.dispatch = dispatch
  }

  computeHeaders (apiKey=undefined) {
    const headers = {
      'Content-Type': 'application/json'
    }
    headers[HEADER_API_VERSION] = API_VERSION

    if (apiKey === undefined) {
      apiKey = cliService.getApiKey()
    }
    headers[HEADER_API_KEY] = apiKey
    return headers
  }

  fetchBackend (url, method, jsonBody=undefined, parseJson=false, cliUrl=undefined, apiKey=undefined) {
    if (!cliUrl) {
      cliUrl = cliService.getCliUrl()
    }
    return utils.fetch(cliUrl + url, {
      method,
      headers: this.computeHeaders(apiKey),
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined
    }, parseJson)
  }

  fetchBackendAsJson (url, method, jsonBody=undefined, cliUrl=undefined, apiKey=undefined) {
    return this.fetchBackend(url, method, jsonBody, true, cliUrl, apiKey)
  }

  withStatus (mainLabel, label, executor, itemId, silent=false) {
    console.log(`=> req backend: ${mainLabel}: ${label}`)
    return status.executeWithStatus(
      mainLabel,
      label,
      executor,
      this.dispatch,
      itemId,
      silent
    )
  }

  cli = {
    fetchState: (cliUrl=undefined, apiKey=undefined) => {
      return this.withStatus('CLI', 'Fetch state', () =>
          this.fetchBackendAsJson('/rest/cli', 'GET', undefined, cliUrl, apiKey)
        , 'cli.status', true)
    },
    init: (cliUrl, apiKey, pairingPayload) => {
      return this.withStatus('CLI', 'Initialize configuration', () =>
        this.fetchBackendAsJson('/rest/cli/init', 'POST', {
          pairingPayload: pairingPayload
        }, cliUrl, apiKey)
        , 'cli.init')
    },
    login: (seedPassphrase) => {
      return this.withStatus('CLI', 'Authenticate', () =>
          this.fetchBackendAsJson('/rest/cli/login', 'POST', {
            seedPassphrase: seedPassphrase
          })
        , 'cli.login')
    },
    logout: () => {
      return this.withStatus('CLI', 'Authenticate', () =>
          this.fetchBackendAsJson('/rest/cli/logout', 'POST')
        , 'cli.logout')
    },
    getConfig: () => {
      return this.withStatus('CLI', 'Fetch configuration', () =>
          this.fetchBackendAsJson('/rest/cli/config', 'GET')
        , 'cli.getConfig')
    },
    setConfig: (config) => {
      return this.withStatus('CLI', 'Save configuration', () =>
          this.fetchBackend('/rest/cli/config', 'POST', {
            config: config
          })
        , 'cli.setConfig')
    },
    resetConfig: () => {
      return this.withStatus('CLI', 'Reset configuration', () =>
          this.fetchBackend('/rest/cli/config', 'DELETE')
        , 'cli.resetConfig')
    }
  };

  pools = {
    fetchPools: () => {
      return this.withStatus('Pools', 'Fetch pools', () =>
          this.fetchBackendAsJson('/rest/pools', 'GET')
        , 'pools.fetchPools', true)
    }
  };

  wallet = {
    fetchUtxos: () => {
      return this.withStatus('Wallet', 'Fetch utxos', () =>
        this.fetchBackendAsJson('/rest/utxos', 'GET')
        , 'wallet.fetchUtxos', true)
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
        , 'mix.fetchState', true)
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
    tx0: (hash, index, feeTarget, poolId, mixsTarget) => {
      return this.withStatus('Utxo', 'New tx0', () =>
        this.fetchBackendAsJson('/rest/utxos/'+hash+':'+index+'/tx0', 'POST', {
          feeTarget: feeTarget,
          poolId: poolId,
          mixsTarget: mixsTarget
        })
      )
    },
    configure: (hash, index, poolId, mixsTarget) => {
      return this.withStatus('Utxo', 'Configure utxo', () =>
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
  };

  gui = {
    versions: () => {
      return this.withStatus('GUI', 'Check for updates', () => {
          const headers = {
            cache: "no-store"
          }
          return utils.fetch(VERSIONS_URL, { method: 'GET', headers: headers }, true)
        },
        'gui.versions', true
      )
    }
  }
}
const backendService = new BackendService()
export default backendService
