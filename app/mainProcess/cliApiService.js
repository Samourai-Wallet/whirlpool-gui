import { APP_USERDATA, IS_DEV } from '../const';
import cliVersion from './cliVersion';
import { logger } from '../utils/logger';
import guiConfig from './guiConfig';

export const API_MODES = {
  RELEASE: 'RELEASE',
  LOCAL: 'LOCAL',
  QA: 'QA'
}
const DL_PATH_LOCAL = '/zl/workspaces/whirlpool/whirlpool-client-cli4/target/'

export class CliApiService {
  constructor (apiVersion) {
    let apiMode = guiConfig.getApiMode()
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

  getCliPath() {
    if (this.isApiModeLocal()) {
      // local CLI
      return DL_PATH_LOCAL
    }

    // standard CLI download path
    return APP_USERDATA
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
      const projectUrl = fetchVersion === API_MODES.QA ? 'SamouraiDev/QA' : 'Samourai-Wallet/whirlpool-client-cli'
      return {
        cliVersion: cliApi.CLI_VERSION,
        filename: 'whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar',
        url: 'https://github.com/'+projectUrl+'/releases/download/' + cliApi.CLI_VERSION + '/whirlpool-client-cli-' + cliApi.CLI_VERSION + '-run.jar',
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
