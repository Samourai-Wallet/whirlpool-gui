import fetch from 'node-fetch';
import { IS_DEV, IS_DEVELOP_SNAPSHOT, VERSIONS_URL } from '../const';

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
    if (IS_DEVELOP_SNAPSHOT) {
      cliApi = 'develop-SNAPSHOT'
    }
    return this.fetchVersions().then(json => {
      console.log('cliVersions',json)
      return json.CLI_API[cliApi]
    })
  }

}

const cliVersion = new CliVersion()
export default cliVersion
