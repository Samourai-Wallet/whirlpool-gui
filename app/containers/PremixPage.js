// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import * as Icon from 'react-feather';
import walletService from '../services/walletService';
import utils from '../services/utils';
import mixService from '../services/mixService';
import poolsService from '../services/poolsService';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import UtxoPoolSelector from '../components/Utxo/UtxoPoolSelector';
import UtxoMixsTargetSelector from '../components/Utxo/UtxoMixsTargetSelector';
import UtxoControls from '../components/Utxo/UtxoControls';

type Props = {};

export default class PremixPage extends Component<Props> {
  props: Props;

  render() {
    if (!walletService.isReady()) {
      return <small>Fetching wallet...</small>
    }
    if (!mixService.isReady()) {
      return <small>Fetching mix state...</small>
    }
    if (!poolsService.isReady()) {
      return <small>Fetching pools...</small>
    }

    const utxosPremix = walletService.getUtxosPremix()
    return (
      <div className='premixPage'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Premix</h2>
          </div>
          <div className='col-sm-10 stats'>
            <span className='text-primary'>{utxosPremix.length} utxos ({utils.toBtc(walletService.getBalancePremix())}btc)</span>
          </div>
        </div>
        <div className='tablescroll'>
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
            <th scope="col">
              {false && <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" defaultChecked={true} id="autoMix"/>
                <label className="custom-control-label" htmlFor="autoMix">Auto-MIX</label>
              </div>}
            </th>
          </tr>
          </thead>
          <tbody>
          {utxosPremix.map((utxo,i) => {
            const lastActivity = mixService.computeLastActivity(utxo)
            return <tr key={i}>
              <td>
                <small><a href='#' onclick={e => {utils.openExternal(utils.linkExplorer(utxo));e.preventDefault()}}>{utxo.hash}:{utxo.index}</a><br/>
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
              <td>
                <UtxoControls utxo={utxo}/>
              </td>
            </tr>
          })}
          </tbody>
        </table>
        </div>
      </div>
    );
  }
}
