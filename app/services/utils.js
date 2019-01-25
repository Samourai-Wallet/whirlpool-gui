class Utils {
  constructor () {
  }

  fetchJson (fetch) {
    return fetch.then(resp => {
      const json = resp.json()
      if (resp.status >= 200 && resp.status < 300) {
        return json
      }
      return json.then(Promise.reject.bind(Promise))
    })
  }
}

const utils = new Utils()
export default utils
