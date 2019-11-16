import { logger } from '../utils/logger';
import fs from 'fs';
import electron from 'electron';

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

class GuiConfig {

  constructor() {
    this.cfg = this.loadConfig()
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

  validate(config) {
    if (!config || !config.API_MODE || !API_MODES[config.API_MODE]) {
      logger.error("guiConfig is invalid: "+GUI_CONFIG_FILEPATH)
      return false
    }
    return true
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
}

const guiConfig = new GuiConfig()
export default guiConfig
