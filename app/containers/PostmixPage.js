// @flow
import React, { Component } from 'react';
import './PostmixPage.css';
import * as Icon from 'react-feather';
import moment from 'moment';
import walletService from '../services/walletService';
import utils, { WHIRLPOOL_ACCOUNTS } from '../services/utils';
import mixService from '../services/mixService';
import modalService from '../services/modalService';
import poolsService from '../services/poolsService';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import UtxoPoolSelector from '../components/Utxo/UtxoPoolSelector';
import UtxoMixsTargetSelector from '../components/Utxo/UtxoMixsTargetSelector';
import UtxoControls from '../components/Utxo/UtxoControls';

type Props = {};

export default class PostmixPage extends Component<Props> {
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

    const utxosPostmix = walletService.getUtxosPostmix()
    return (
      <div className='postmixPage'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Postmix</h2>
          </div>
          <div className='col-sm-10 stats'>
            <a className='zpubLink' href='#' onClick={e => {modalService.openZpub(WHIRLPOOL_ACCOUNTS.POSTMIX, walletService.getZpubPostmix());e.preventDefault()}}>ZPUB</a>
            <span className='text-primary'>{utxosPostmix.length} utxos ({utils.toBtc(walletService.getBalancePostmix())}btc)</span>
          </div>
        </div>
        <div className="tablescroll">
        <table className="table table-sm table-hover">
          <thead>
          <tr>
            <th scope="col">UTXO</th>
            <th scope="col">Amount</th>
            <th scope="col">Pool</th>
            <th scope="col" className='utxoStatus' colSpan={2}>Status</th>
            <th scope="col">Mixs</th>
            <th scope="col" colSpan={2}>Last activity</th>
            <th scope="col">
            </th>
          </tr>
          </thead>
          <tbody>
          {utxosPostmix.map((utxo,i) => {
            const lastActivity = mixService.computeLastActivity(utxo)
            return <tr key={i}>
              <td>
                <small><a href='#' onClick={e => {utils.openExternal(utils.linkExplorer(utxo));e.preventDefault()}}>{utxo.hash}:{utxo.index}</a><br/>
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
