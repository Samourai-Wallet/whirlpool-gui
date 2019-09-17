/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import * as Icon from 'react-feather';
import utils, { MIXABLE_STATUS, UTXO_STATUS, WHIRLPOOL_ACCOUNTS } from '../../services/utils';
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
            {this.props.account && <th scope="col">Account</th>}
            <th scope="col" className='utxo'>UTXO</th>
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
            const utxoReadOnly = utils.isUtxoReadOnly(utxo)
            const allowNoPool = utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT
            return <tr key={i} className={utxoReadOnly?'utxo-disabled':''}>
              {this.props.account && <td><small>{utxo.account}</small></td>}
              <td>
                <small><span title={utxo.hash+':'+utxo.index}><LinkExternal href={utils.linkExplorer(utxo)}>{utxo.hash.substring(0,20)}...{utxo.hash.substring(utxo.hash.length-5)}:{utxo.index}</LinkExternal></span> · {utxo.path} · {utxo.confirmations>0?<span>{utxo.confirmations} confirms</span>:<strong>unconfirmed</strong>}</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>{!utxoReadOnly && <UtxoPoolSelector utxo={utxo} noPool={allowNoPool}/>}
              </td>
              <td>{!utxoReadOnly && <span className='text-primary'>{utils.statusLabel(utxo)}</span>}</td>
              <td></td>
              <td>
                {!utxoReadOnly && <UtxoMixsTargetSelector utxo={utxo}/>}
              </td>
              <td className='utxoMessage'>{!utxoReadOnly && <small>{utils.utxoMessage(utxo)}</small>}</td>
              <td>{!utxoReadOnly && <small>{lastActivity ? lastActivity : '-'}</small>}</td>
              <td>{!utxoReadOnly && controls && this.renderUtxoControls(utxo)}</td>
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
        {utxo.account == WHIRLPOOL_ACCOUNTS.DEPOSIT && mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Tx0' onClick={() => modalService.openTx0(utxo)} >Tx0 <Icon.ChevronsRight size={12}/></button>}
        {mixService.isStartMixPossible(utxo) && utxo.mixableStatus === MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMixUtxo(utxo)}>Mix <Icon.Play size={12} /></button>}
        {mixService.isStartMixPossible(utxo) && utxo.mixableStatus !== MIXABLE_STATUS.MIXABLE && <button className='btn btn-sm btn-border' title='Add to queue' onClick={() => mixService.startMixUtxo(utxo)}><Icon.Plus size={12} />queue</button>}
        {mixService.isStopMixPossible(utxo) && utxo.status === UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-border' title='Remove from queue' onClick={() => mixService.stopMixUtxo(utxo)}><Icon.Minus size={12} />queue</button>}
        {mixService.isStopMixPossible(utxo) && utxo.status !== UTXO_STATUS.MIX_QUEUE && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMixUtxo(utxo)}>Stop <Icon.Square size={12} /></button>}
      </div>
    )
  }
}

export default UtxosTable
