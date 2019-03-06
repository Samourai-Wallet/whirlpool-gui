/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import * as Icon from 'react-feather';
import { WHIRLPOOL_ACCOUNTS } from '../../services/utils';

/* eslint-disable react/prefer-stateless-function */
class UtxoControls extends React.PureComponent {

  render () {
    const utxo = this.props.utxo
    return (
      <div>
        {utxo.account == WHIRLPOOL_ACCOUNTS.DEPOSIT && utxo.confirmations === 0 && <small>unconfirmed</small>}
        {utxo.account == WHIRLPOOL_ACCOUNTS.DEPOSIT && mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Tx0' onClick={() => mixService.tx0(utxo)} >Tx0 <Icon.ChevronsRight size={12}/></button>}
        {mixService.isStartMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMixUtxo(utxo)}>Mix <Icon.Play size={12} /></button>}
        {mixService.isStopMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMixUtxo(utxo)}>Stop <Icon.Square size={12} /></button>}
      </div>
    )
  }
}

export default UtxoControls
