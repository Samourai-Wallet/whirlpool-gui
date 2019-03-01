/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import modalService from '../../services/modalService';
import * as Icon from 'react-feather';

/* eslint-disable react/prefer-stateless-function */
class UtxoControls extends React.PureComponent {

  render () {
    const utxo = this.props.utxo
    return (
      <div>
        {mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Tx0' onClick={() => modalService.openTx0(utxo)} >Tx0 <Icon.ChevronsRight size={12}/></button>}
        {mixService.isStartMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMix(utxo)}>Mix <Icon.Play size={12} /></button>}
        {mixService.isStopMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMix(utxo)}>Stop <Icon.Square size={12} /></button>}
      </div>
    )
  }
}

export default UtxoControls
