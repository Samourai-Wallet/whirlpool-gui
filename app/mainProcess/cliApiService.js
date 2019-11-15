import { IS_DEV } from '../const';
import electron from "electron";
import cliVersion from './cliVersion';
import { logger } from '../utils/logger';

export const API_MODES = {
  RELEASE: 'RELEASE',
  LOCAL: 'LOCAL',
  QA: 'QA'
}
const DL_PATH_LOCAL = '/zl/workspaces/whirlpool/whirlpool-client-cli4/target/'

export class CliApiService {
  constructor (apiMode, apiVersion) {
    if (IS_DEV) {
      // use local jar when started with "yarn dev"
      apiMode = API_MODES.LOCAL
    }
    this.apiMode = apiMode
    this.apiVersion = apiVersion
    logger.info('Initializing CliApiService: '+this.getVersionName())
  }

  getApiMode() {
    return this.apiMode
  }

  getApiVersion() {
    return this.apiVersion
  }

  isApiModeRelease() {
    return this.apiMode === API_MODES.RELEASE
  }

  isApiModeLocal() {
    return this.apiMode === API_MODES.LOCAL
  }

  useChecksum() {
    // skip checksum verification when started with "yarn dev"
    return !IS_DEV
  }

  getDownloadPath() {
    if (this.isApiModeLocal()) {
      return DL_PATH_LOCAL
    }
    const app = electron.app || electron.remote.app;
    return app.getPath('userData')
  }

  async fetchCliApi() {
    if (this.isApiModeLocal()) {
      // use local jar
      return {
        cliVersion: 'develop-SNAPSHOT',
        filename: 'whirlpool-client-cli-develop-SNAPSHOT-run.jar',
        url: false,
        checksum: false
      }
    }
    const fetchVersion = this.isApiModeRelease() ? this.apiVersion : this.getApiMode()
    try {
      let cliApi = await cliVersion.fetchCliApi(fetchVersion)
      logger.info('Using CLI_API ' + fetchVersion, cliApi)
      return {
        cliVersion: cliApi.CLI_VERSION,
        filename: 'whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar',
        url: 'https://github.com/Samourai-Wallet/whirlpool-client-cli/releases/download/' + cliApi.CLI_VERSION + '/whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar',
        checksum: cliApi.CLI_CHECKSUM
      }
    } catch(e) {
      logger.error("Could not fetch CLI_API "+fetchVersion, e)
      throw e
    }
  }

  getVersionName() {
    let version =  this.apiVersion
    if (!this.isApiModeRelease()) {
      version += " ("+this.apiMode+")"
    }
    return version
  }

}
