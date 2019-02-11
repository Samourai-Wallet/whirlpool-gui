import utils from './utils';
import status from './status';

const HOST = 'http://127.0.0.1:8899'
const API_VERSION = '0.3'
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

  wallet = {
    fetchUtxos: () => {
      return this.withStatus('Wallet', 'Fetch utxos', () =>
        this.fetchBackendAsJson('/rest/wallet/utxos', 'GET')
      )
    },

    fetchDeposit: (increment) => {
      return this.withStatus('Wallet', 'Fetch deposit address', () =>
        this.fetchBackendAsJson('/rest/wallet/deposit?increment='+increment, 'GET')
      )
    }
  };

  mix = {
    fetchState: () => {
      return this.withStatus('Mix', 'Fetch state', () =>
        this.fetchBackendAsJson('/rest/mix', 'GET')
      )
    },
    start: () => {
      return this.withStatus('Mix', 'Start mixing', () =>
        this.fetchBackend('/rest/mix/start', 'POST')
      )
    },
    stop: () => {
      return this.withStatus('Mix', 'Stop mixing', () =>
        this.fetchBackend('/rest/mix/stop', 'POST')
      )
    },
  };
}
const backendService = new BackendService()
export default backendService
