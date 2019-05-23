import ifNot from 'if-not-running';
import fetch from 'node-fetch';
import { GUI_VERSION, VERSIONS_URL } from '../const';
import cliService from './cliService';
import backendService from './backendService';

const REFRESH_RATE = 1800000; //30min
class GuiService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('guiService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('guiState: init...')
        if (state !== undefined) {
          console.log('guiState: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('guiState: already initialized')
      }
    })
  }

  start() {
    if (this.refreshTimeout === undefined) {
      this.refreshTimeout = setInterval(this.fetchState.bind(this), REFRESH_RATE)
      return this.fetchState()
    }
    return Promise.resolve()
  }

  stop() {
    if (this.refreshTimeout) {
      clearInterval(this.refreshTimeout)
    }
    this.refreshTimeout = undefined
    this.state = {}
  }

  isReady() {
    return this.state && this.state.guiLast
  }

  // getUpdate


  getGuiUpdate () {
    if (!this.isReady() || !cliService.isConnected()) {
      return undefined
    }
    const serverName = cliService.getServerName()
    if (serverName && this.state.guiLast[serverName] && this.state.guiLast[serverName] !== GUI_VERSION) {
      // update available
      return this.state.guiLast[serverName]
    }
    // no update available
    return undefined
  }

  fetchState () {
    return ifNot.run('guiService:fetchState', () => {
      // fetch GUI_LAST
      return backendService.gui.versions()
        .then(json => {
          // set state
          if (this.state === undefined) {
            console.log('guiService: initializing new state')
            this.state = {
              guiLast: json.GUI.LAST
            }
          } else {
            console.log('guiService: updating existing state', Object.assign({}, this.state))
            this.state.guiLast = json.GUI.LAST
          }
          this.pushState()
        })
    })
  }

  pushState () {
    this.setState(this.state)
  }
}

const guiService = new GuiService()
export default guiService
