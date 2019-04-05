import fetch from 'node-fetch'

const VERSIONS_URL = "https://raw.githubusercontent.com/Samourai-Wallet/whirlpool-runtimes/master/CLI.json"
class CliVersion {

  constructor() {
  }

  fetchVersions() {
    return fetch(VERSIONS_URL)
      .then(res => res.json())
  }

  fetchCliApi(cliApi) {
    return this.fetchVersions().then(json => json.CLI_API[cliApi])
  }

}

const cliVersion = new CliVersion()
export default cliVersion
