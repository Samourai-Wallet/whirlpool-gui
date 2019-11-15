import fetch from 'node-fetch';
import { VERSIONS_URL } from '../const';

class CliVersion {

  constructor() {
  }

  fetchVersions() {
    return fetch(VERSIONS_URL, {cache: "no-store"})
      .then(res => res.json())
  }

  fetchCliApi(cliApi) {
    return this.fetchVersions().then(json => {
      console.log('cliVersions',json)
      return json.CLI_API[cliApi]
    })
  }

}

const cliVersion = new CliVersion()
export default cliVersion
