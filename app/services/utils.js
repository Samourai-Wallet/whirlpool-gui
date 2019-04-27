import cliService from './cliService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';

const AMOUNT_PRECISION = 4
const BTC_TO_SAT = 100000000
export const TX0_MIN_CONFIRMATIONS = 1
export const MIXSTARGET_UNLIMITED = 0
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
    return 'https://m.oxt.me/transaction/'+utxo.hash
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

  torIcon() {
    return <svg width="32" height="32" version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-58.12 -303.3)">
        <path d="m77.15 303.3c-1.608 1.868-0.09027 2.972-0.9891 4.84 1.514-2.129 5.034-2.862 7.328-3.643-3.051 2.72-5.457 6.326-8.489 9.009l-1.975-0.8374c-0.4647-4.514-1.736-4.705 4.125-9.369z" fill-rule="evenodd"/>
        <path d="m74.04 313.1 2.932 0.9454c-0.615 2.034 0.3559 2.791 0.9472 3.123 1.324 0.7332 2.602 1.49 3.619 2.412 1.916 1.75 3.004 4.21 3.004 6.812 0 2.578-1.183 5.061-3.169 6.717-1.868 1.561-4.446 2.223-6.953 2.223-1.561 0-2.956-0.0708-4.47-0.5677-3.453-1.159-6.031-4.115-6.244-7.663-0.1893-2.767 0.4257-4.872 2.578-7.072 1.111-1.159 2.563-2.749 4.1-3.813 0.757-0.5204 1.119-1.191-0.4183-3.958l1.28-1.076 2.795 1.918-2.352-0.3007c0.1656 0.2366 1.189 0.7706 1.284 1.078 0.2128 0.8751-0.1911 1.771-0.3804 2.149-0.9696 1.75-1.86 2.275-3.066 3.268-2.129 1.75-4.27 2.836-4.01 7.637 0.1183 2.365 1.433 5.295 4.2 6.643 1.561 0.757 2.859 1.189 4.68 1.284 1.632 0.071 4.754-0.8988 6.457-2.318 1.821-1.514 2.838-3.808 2.838-6.149 0-2.365-0.9461-4.612-2.72-6.197-1.017-0.9223-2.696-2.034-3.737-2.625-1.041-0.5912-2.782-2.06-2.356-3.645z"/>
        <path d="m73.41 316.6c-0.186 1.088-0.4177 3.117-0.8909 3.917-0.3293 0.5488-0.4126 0.8101-0.7846 1.094-1.09 1.535-1.45 1.761-2.132 4.552-0.1447 0.5914-0.3832 1.516-0.2591 2.107 0.372 1.703 0.6612 2.874 1.316 4.103 0 0 0.1271 0.1217 0.1271 0.169 0.6821 0.9225 0.6264 1.05 2.665 2.246l-0.06204 0.3313c-1.55-0.4729-2.604-0.9591-3.41-2.024 0-0.0236-0.1513-0.1558-0.1513-0.1558-0.868-1.135-1.753-2.788-2.021-4.546-0.1447-0.7097-0.0769-1.341 0.08833-2.075 0.7026-2.885 1.415-4.093 2.744-5.543 0.3514-0.2601 0.6704-0.6741 1.001-1.092 0.4859-0.6764 1.462-2.841 1.814-4.189z"/>
        <path d="m74.09 318.6c0.0237 1.04 0.0078 3.036 0.3389 3.796 0.0945 0.2599 0.3274 1.414 0.9422 2.794 0.4258 0.96 0.5418 1.933 0.6128 2.193 0.2838 1.14-0.4002 3.086-0.8734 4.906-0.2364 0.98-0.6051 1.773-1.371 2.412l0.2796 0.3593c0.5204-0.02 1.954-1.096 2.403-2.416 0.757-2.24 1.328-3.317 0.9729-5.797-0.0473-0.2402-0.2094-1.134-0.6588-2.014-0.6622-1.34-1.474-2.614-1.592-2.874-0.213-0.4198-1.007-2.119-1.054-3.359z"/>
        <path d="m74.88 313.9 0.9727 0.4962c-0.09145 0.6403 0.04572 2.059 0.686 2.424 2.836 1.761 5.512 3.683 6.565 5.604 3.751 6.771-2.63 13.04-8.143 12.44 2.996-2.219 4.428-6.583 3.307-11.55-0.4574-1.944-1.729-3.893-2.987-5.883-0.545-0.9768-0.3547-2.188-0.4006-3.538z" fill-rule="evenodd"/>
        <rect x="73.07" y="312.8" width="1" height="22"/>
      </g>
    </svg>
  }
}

const utils = new Utils()
export default utils
