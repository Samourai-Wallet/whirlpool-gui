/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import * as Icon from 'react-feather';
import utils, { WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import LinkExternal from '../Utils/LinkExternal';
import UtxoMixsTargetSelector from './UtxoMixsTargetSelector';
import UtxoPoolSelector from './UtxoPoolSelector';
import modalService from '../../services/modalService';


/* eslint-disable react/prefer-stateless-function */
class UtxosTable extends React.PureComponent {

  render () {
    const controls = this.props.controls
    return (
      <div className='table-utxos'>
        <table className="table table-sm table-hover">
          <thead>
          <tr>
            <th scope="col">UTXO</th>
            <th scope="col">Amount</th>
            <th scope="col">Pool</th>
            <th scope="col" className='utxoStatus'>Status</th>
            <th scope="col"></th>
            <th scope="col">Mixs</th>
            <th scope="col" colSpan={2}>Last activity</th>
            {controls && <th scope="col" className='utxoControls'></th>}
          </tr>
          </thead>
          <tbody>
          {this.props.utxos.map((utxo,i) => {
            const lastActivity = mixService.computeLastActivity(utxo)
            return <tr key={i}>
              <td>
                <small><LinkExternal href={utils.linkExplorer(utxo)}>{utxo.hash}:{utxo.index}</LinkExternal><br/>
                  {utxo.account} · {utxo.path} · {utxo.confirmations>0?<span>{utxo.confirmations} confirms</span>:<strong>unconfirmed</strong>}</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>
                <UtxoPoolSelector utxo={utxo}/>
              </td>
              <td><span className='text-primary'>{utils.statusLabel(utxo)}</span></td>
              <td></td>
              <td>
                <UtxoMixsTargetSelector utxo={utxo}/>
              </td>
              <td><small>{utils.utxoMessage(utxo)}</small></td>
              <td><small>{lastActivity ? lastActivity : '-'}</small></td>
              {controls && <td>{this.renderUtxoControls(utxo)}</td>}
            </tr>
          })}
          </tbody>
        </table>
      </div>
    )
  }

  renderUtxoControls (utxo) {
    return (
      <div>
        {utxo.account == WHIRLPOOL_ACCOUNTS.DEPOSIT && utxo.confirmations === 0 && <small>unconfirmed</small>}
        {utxo.account == WHIRLPOOL_ACCOUNTS.DEPOSIT && mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Tx0' onClick={() => modalService.openTx0(utxo)} >Tx0 <Icon.ChevronsRight size={12}/></button>}
        {mixService.isStartMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMixUtxo(utxo)}>Mix <Icon.Play size={12} /></button>}
        {mixService.isStopMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMixUtxo(utxo)}>Stop <Icon.Square size={12} /></button>}
      </div>
    )
  }
}

export default UtxosTable
