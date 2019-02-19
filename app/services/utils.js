const AMOUNT_PRECISION = 4
const BTC_TO_SAT = 100000000
export const TX0_MIN_CONFIRMATIONS = 1

class Utils {
  constructor () {
  }

  fetch(input, init, json=false) {
    return fetch(input, init).then(resp => {
      if (!resp || !resp.ok) {
        const message = 'Fetch failed: status='+(resp ? resp.status : 'null')
        console.error(message)
        return Promise.reject(message)
      }
      if (json) {
        return resp.json()
      }
      return resp
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

  statusLabel(status) {
    switch(status) {
      case 'READY': return 'READY'
      case 'TX0': return 'TX0'
      case 'TX0_SUCCESS': return 'TX0:SUCCESS'
      case 'TX0_FAILED': return 'TX0:ERROR'
      case 'MIX_QUEUE': return 'MIX:QUEUED'
      case 'MIX_STARTED': return 'MIXING'
      case 'MIX_SUCCESS': return 'MIX:SUCCESS'
      case 'MIX_FAILED': return 'MIX:ERROR'
      default: return '?'
    }
  }
}

const utils = new Utils()
export default utils
