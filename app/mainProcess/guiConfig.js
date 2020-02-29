import { logger } from '../utils/logger';
import fs from 'fs';
import electron from 'electron';
import Store from 'electron-store';
import { STORE_CLILOCAL } from '../const';

// for some reason cliApiService.API_MODES is undefined here
const API_MODES = {
  RELEASE: 'RELEASE',
  LOCAL: 'LOCAL',
  QA: 'QA'
}

const CONFIG_DEFAULT = {
  API_MODE: API_MODES.RELEASE
}

// for some reason const.APP_USERDATA is undefined here...
const app = electron.app || electron.remote.app;
const APP_USERDATA = app.getPath('userData')

const GUI_CONFIG_FILENAME = 'whirlpool-gui-config.json';
const GUI_CONFIG_FILEPATH = APP_USERDATA+'/'+GUI_CONFIG_FILENAME

const STORE_CLIURL = "cli.url"
const STORE_APIKEY = "cli.apiKey"
const STORE_GUICONFIG_VERSION = "guiConfig.version"

const GUI_CONFIG_VERSION = 1

class GuiConfig {

  constructor() {
    this.store = new Store()
    this.cfg = this.loadConfig()
    this.checkUpgradeGui()
  }

  loadConfig() {
    let config = undefined
    try {
      config = JSON.parse(fs.readFileSync(GUI_CONFIG_FILEPATH, 'utf8'));
    } catch(e) {
    }
    if (!this.validate(config)) {
      logger.info("Using GUI configuration: default")
      config = CONFIG_DEFAULT
      this.hasConfig = false
    } else {
      logger.info("Using GUI configuration: "+GUI_CONFIG_FILEPATH)
      this.hasConfig = true
    }
    return config
  }

  checkUpgradeGui() {
    const fromGuiConfigVersion = this.store.get(STORE_GUICONFIG_VERSION)
    logger.info("fromGuiConfigVersion=" + fromGuiConfigVersion + ", GUI_CONFIG_VERSION=" + GUI_CONFIG_VERSION)
    if (!fromGuiConfigVersion || fromGuiConfigVersion !== GUI_CONFIG_VERSION) {
      this.upgradeGui(fromGuiConfigVersion)
      this.store.set(STORE_GUICONFIG_VERSION, GUI_CONFIG_VERSION)
    }
  }

  upgradeGui(fromGuiConfigVersion) {
    logger.info("Upgrading GUI: " + fromGuiConfigVersion + " -> " + GUI_CONFIG_VERSION)

    // VERSION 1: use HTTPS
    if (!fromGuiConfigVersion || fromGuiConfigVersion < 1) {
      // move CLIURL to HTTPS
      const cliUrl = this.getCliUrl()
      logger.info("cliUrl=" + cliUrl)
      if (cliUrl && cliUrl.indexOf('http://') !== -1) {
        const cliUrlHttps = cliUrl.replace('http://', 'https://')
        logger.info("Updating cliUrl: " + cliUrl + ' -> ' + cliUrlHttps)
        this.setCliUrl(cliUrlHttps)
      }
    }
  }

  validate(config) {
    if (config) {
      if (config.API_MODE && API_MODES[config.API_MODE]) {
        // valid
        return true
      }
      // invalid
      logger.error("guiConfig is invalid: "+GUI_CONFIG_FILEPATH)
    }
    // or not existing
    return false
  }

  getApiMode() {
    return this.cfg.API_MODE
  }

  hasConfig() {
    return this.hasConfig
  }

  getConfigFile() {
    return GUI_CONFIG_FILEPATH
  }

  // CLI CONFIG

  setCliUrl(cliUrl) {
    logger.info('guiConfig: set cliUrl='+cliUrl)
    this.store.set(STORE_CLIURL, cliUrl)
  }

  setCliApiKey(apiKey) {
    this.store.set(STORE_APIKEY, apiKey)
  }

  setCliLocal(cliLocal) {
    this.store.set(STORE_CLILOCAL, cliLocal)
  }

  resetCliConfig() {
    this.store.delete(STORE_CLIURL)
    this.store.delete(STORE_APIKEY)
    this.store.delete(STORE_CLILOCAL)
  }

  getCliUrl() {
    return this.store.get(STORE_CLIURL)
  }

  getCliApiKey() {
    return this.store.get(STORE_APIKEY)
  }

  getCliLocal() {
    return this.store.get(STORE_CLILOCAL)
  }
}

const guiConfig = new GuiConfig()
export default guiConfig
