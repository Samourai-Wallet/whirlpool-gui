const AMOUNT_PRECISION = 4
const BTC_TO_SAT = 100000000

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

  sumUtxos (utxos) {
    return utxos.reduce(function (sum, utxo) {
      return sum + utxo.value;
    }, 0);
  }

  scale (value, precision) {
    const factor = Math.pow(10, precision)
    return Math.floor(value * factor) / factor
  }

  toBtc (sats, scale = false) {
    if (sats === 0) {
      return 0
    }
    let valueBtc = sats / BTC_TO_SAT
    if (scale === true) valueBtc = this.scale(valueBtc, AMOUNT_PRECISION)
    return valueBtc
  }

  linkExplorer(utxo) {
    return 'https://blockstream.info/testnet/tx/'+utxo.hash
  }
}

const utils = new Utils()
export default utils
