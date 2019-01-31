import utils from './utils';
import status from './status';

const HOST = 'http://127.0.0.1:8080'
const API_VERSION = '0.2'
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

  fetchBackend (url, method, jsonBody) {
    return fetch(HOST + url, {
      method,
      headers: this.computeHeaders(),
      body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined
    })
  }

  fetchJsonBackend (url, method, jsonBody) {
    return utils.fetchJson(this.fetchBackend(url, method, jsonBody))
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
    fetchWallet: () => {
      return this.withStatus('Wallet', 'Fetch wallet state', () =>
        this.fetchJsonBackend('/rest/wallet', 'GET')
      )
    },

    fetchDeposit: (increment) => {
      return this.withStatus('Wallet', 'Fetch deposit address', () =>
        this.fetchJsonBackend('/rest/wallet/deposit?increment='+increment, 'GET')
      )
    }
  };
}
const backendService = new BackendService()
export default backendService
