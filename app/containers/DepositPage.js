// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './PremixPage.css';
import * as Icon from 'react-feather';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/walletActions';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import modalService from '../services/modalService';
import utils, { TX0_MIN_CONFIRMATIONS } from '../services/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import mixService from '../services/mixService';

class DepositPage extends Component {

  constructor(props) {
    super(props)
  }

  // tx0

  render() {
    const utxosDeposit = walletService.getUtxosDeposit()
    return (
      <div className='depositPage'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Deposit</h2>
          </div>
          <div className='col-sm-8 stats'>
            <span className='text-primary'>{utxosDeposit.length} utxos on deposit ({utils.toBtc(walletService.getBalanceDeposit())}btc)</span>
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
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody>
          {utxosDeposit.map((utxo,i) => {
            return <tr key={i}>
              <td>
                <small><a href={utils.linkExplorer(utxo)} target='_blank'>{utxo.hash}:{utxo.index}</a><br/>
                  {utxo.account} · {utxo.path} · {utxo.confirmations} confirms</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>{utxo.poolId}</td>
              <td><span className='text-primary'>{utils.statusLabel(utxo.status)}</span></td>
              <td></td>
              <td>{utxo.mixsDone}/{utxo.mixsTarget}</td>
              <td>{utxo.message}</td>
              <td><small>{mixService.computeLastActivity(utxo)}</small></td>
              <td>
                {utxo.confirmations < TX0_MIN_CONFIRMATIONS && <small>unconfirmed</small>}
                {mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => modalService.openTx0(utxo)} >Tx0 <Icon.ChevronsRight size={12}/></button>}
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
