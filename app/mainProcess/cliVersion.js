import fetch from 'node-fetch'
import { IS_DEV } from '../const';

const VERSIONS_URL = "https://raw.githubusercontent.com/Samourai-Wallet/whirlpool-runtimes/master/CLI.json"
class CliVersion {

  constructor() {
  }

  fetchVersions() {
    return fetch(VERSIONS_URL, {cache: "no-store"})
      .then(res => res.json())
  }

  fetchCliApi(cliApi) {
    if (IS_DEV) {
      // mock for DEV
      return {
        CLI_VERSION: 'develop-SNAPSHOT',
        CLI_CHECKSUM: 'dev'
      }
    }
    return this.fetchVersions().then(json => {
      console.log('cliVersions',json)
      return json.CLI_API[cliApi]
    })
  }

}

const cliVersion = new CliVersion()
export default cliVersion
