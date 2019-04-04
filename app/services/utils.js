import cliService from './cliService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';

const AMOUNT_PRECISION = 4
const BTC_TO_SAT = 100000000
export const TX0_MIN_CONFIRMATIONS = 1
export const MIXSTARGET_UNLIMITED = 0
export const CLI_CONFIG_FILENAME = 'whirlpool-cli-config.properties'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const WHIRLPOOL_ACCOUNTS = {
  DEPOSIT: 'DEPOSIT',
  PREMIX: 'PREMIX',
  POSTMIX: 'POSTMIX'
}

export const UTXO_STATUS = {
  READY: 'READY',

  TX0: 'TX0',
  TX0_FAILED: 'TX0_FAILED',
  TX0_SUCCESS: 'TX0_SUCCESS',

  MIX_QUEUE: 'MIX_QUEUE',
  MIX_STARTED: 'MIX_STARTED',
  MIX_SUCCESS: 'MIX_SUCCESS',
  MIX_FAILED: 'MIX_FAILED'
}

export const MIXABLE_STATUS = {
  MIXABLE: 'MIXABLE',
  UNCONFIRMED: 'UNCONFIRMED',
  HASH_MIXING: 'HASH_MIXING',
  NO_POOL: 'NO_POOL'
}

export const CLI_STATUS = {
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  NOT_READY: 'NOT_READY',
  READY: 'READY'
}

class Utils {
  constructor () {
  }

  fetch(input, init, json=false) {
    return fetch(input, init).then(resp => {
      if (!resp) {
        const message = 'Fetch failed'
        console.error('fetch error:', message)
        return Promise.reject(new Error(message))
      }
      if (!resp.ok) {
        return resp.json().then(responseError => {
          const message = responseError.message ? responseError.message : 'Fetch failed'
          console.error('fetch error:', message)
          return Promise.reject(new Error(message))
        })
        const message = 'Fetch failed: status='+resp.status
        console.error('fetch error:', message)
        return Promise.reject(new Error(message))
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
    if (cliService.isTestnet()) {
      return 'https://blockstream.info/testnet/tx/'+utxo.hash
    }
    return 'https://oxt.me/transaction/'+utxo.hash
  }

  statusIcon(utxo) {

    if (utxo.status === UTXO_STATUS.MIX_STARTED) {
      return <FontAwesomeIcon icon={Icons.faPlay} size='xs' color='green' title='MIXING'/>
    }
    if (utxo.status === UTXO_STATUS.TX0) {
      return <FontAwesomeIcon icon={Icons.faPlay} size='xs' color='green' title='TX0'/>
    }
    if (utxo.status === UTXO_STATUS.TX0_FAILED) {
      return <FontAwesomeIcon icon={Icons.faSquare} size='xs' color='red' title='TX0 FAILED'/>
    }
    if (utxo.status === UTXO_STATUS.MIX_FAILED) {
      return <FontAwesomeIcon icon={Icons.faSquare} size='xs' color='red' title='MIX FAILED'/>
    }
    if ((utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX || utxo.status === UTXO_STATUS.MIX_SUCCESS) && utxo.mixsDone >= utxo.mixsTarget) {
      return <FontAwesomeIcon icon={Icons.faCheck} size='xs' color='green' title='MIXED'/>
    }

    switch(utxo.mixableStatus) {
      case MIXABLE_STATUS.MIXABLE:
        return <FontAwesomeIcon icon={Icons.faCircle} size='xs' color='green' title='Ready to mix'/>
      case MIXABLE_STATUS.HASH_MIXING:
        return <FontAwesomeIcon icon={Icons.faEllipsisH} size='xs' color='orange' title='Another utxo from same hash is currently mixing'/>
      case MIXABLE_STATUS.NO_POOL:
        return <FontAwesomeIcon icon={Icons.faExclamation} size='xs' color='red' title='No pool'/>
      case MIXABLE_STATUS.UNCONFIRMED:
        return <FontAwesomeIcon icon={Icons.faClock} size='xs' color='orange' title='Unconfirmed'/>
    }
    return undefined
  }

  statusLabel(utxo) {
    let icon = this.statusIcon(utxo)
    return <span>{icon?icon:''} {this.statusLabelText(utxo)}</span>
  }

  statusLabelText(utxo) {
    switch(utxo.status) {
      case UTXO_STATUS.READY:
        if (utxo.account === WHIRLPOOL_ACCOUNTS.POSTMIX && utxo.mixsDone >= utxo.mixsTarget) {
          return 'MIXED'
        }
        return 'READY'
      case UTXO_STATUS.TX0: return 'TX0'
      case UTXO_STATUS.TX0_SUCCESS: return 'TX0:SUCCESS'
      case UTXO_STATUS.TX0_FAILED: return 'TX0:ERROR'
      case UTXO_STATUS.MIX_QUEUE: return 'QUEUE'
      case UTXO_STATUS.MIX_STARTED: return 'MIXING'
      case UTXO_STATUS.MIX_SUCCESS: return 'MIXED'
      case UTXO_STATUS.MIX_FAILED: return 'MIX:ERROR'
      default: return '?'
    }
  }

  mixsTargetLabel(mixsTarget) {
    return mixsTarget !== MIXSTARGET_UNLIMITED ? mixsTarget : '∞'
  }

}

const utils = new Utils()
export default utils
