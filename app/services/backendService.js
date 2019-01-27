import utils from './utils';
import status from './status';

const HOST = 'http://127.0.0.7:8080'

class BackendService {
  constructor () {
    this.dispatch = undefined
    this.sessid = undefined
  }

  init (dispatch) {
    this.dispatch = dispatch
  }

  setSessid (sessid) {
    console.log('cliService: setSessid', sessid)
    this.sessid = sessid
  }

  computeHeaders () {
    const headers = {
      'Content-Type': 'application/json'
    }
    if (this.sessid !== undefined) {
      headers['X-SESSID'] = this.sessid
    }
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

  session = {
    login: (login, password) =>
      this.withStatus('Login', 'Authenticate', () =>
        this.fetchJsonBackend(
          '/session/login',
          'POST',
          {
            login,
            password
          },
          'session.login'
        )
      ),
    logout: () => this.fetchBackend('/session/logout', 'POST')
  };

  wallet = {
    fetch: () => {
      return this.withStatus('Wallet', 'Fetch wallet state', () =>
        this.fetchJsonBackend('/wallet', 'GET')
      )
    }
  };
}
const backendService = new BackendService()
export default backendService
