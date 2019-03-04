// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import * as Icon from 'react-feather';
import {Dropdown,DropdownButton} from 'react-bootstrap'
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/walletActions';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import modalService from '../services/modalService';
import utils, { TX0_MIN_CONFIRMATIONS } from '../services/utils';
import mixService from '../services/mixService';
import poolsService from '../services/poolsService';
import UtxoPoolSelector from '../components/Utxo/UtxoPoolSelector';
import UtxoMixsTargetSelector from '../components/Utxo/UtxoMixsTargetSelector';
import UtxoControls from '../components/Utxo/UtxoControls';

class DepositPage extends Component {

  constructor(props) {
    super(props)
  }

  // tx0

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

    const utxosDeposit = walletService.getUtxosDeposit()
    return (
      <div className='depositPage'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Deposit</h2>
          </div>
          <div className='col-sm-10 stats'>
            <span className='text-primary'>{utxosDeposit.length} utxos ({utils.toBtc(walletService.getBalanceDeposit())}btc)</span>
          </div>
        </div>
        <div className="tablescroll">
        <table className="table table-sm table-hover">
          <thead>
          <tr>
            <th scope="col">UTXO</th>
            <th scope="col">Amount</th>
            <th scope="col">Pool</th>
            <th scope="col">Status</th>
            <th scope="col"></th>
            <th scope="col">Mixs</th>
            <th scope="col" colSpan={2}>Last activity</th>
            <th scope="col">
              {false && <div className="custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" defaultChecked={true} id="autoTx0"/>
                <label className="custom-control-label" htmlFor="autoTx0">Auto-TX0</label>
              </div>}
            </th>
          </tr>
          </thead>
          <tbody>
          {utxosDeposit.map((utxo,i) => {
            const lastActivity = mixService.computeLastActivity(utxo)
            return <tr key={i}>
              <td>
                <small><a href={utils.linkExplorer(utxo)} target='_blank'>{utxo.hash}:{utxo.index}</a><br/>
                  {utxo.account} · {utxo.path} · {utxo.confirmations>0?<span>{utxo.confirmations} confirms</span>:<strong>unconfirmed</strong>}</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>
                <UtxoPoolSelector utxo={utxo}/>
              </td>
              <td><span className='text-primary'>{utils.statusLabel(utxo.status)}</span></td>
              <td></td>
              <td>
                <UtxoMixsTargetSelector utxo={utxo}/>
              </td>
              <td><small>{utxo.message}</small></td>
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

function mapStateToProps(state) {
  return {
    wallet: state.wallet
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    walletActions: bindActionCreators(walletActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositPage);
