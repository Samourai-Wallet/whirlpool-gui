// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import * as Icon from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
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

class LastActivityPage extends Component {

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

    const utxosDeposit = walletService.getUtxosDeposit().filter(a =>  a.lastActivityElapsed ? true : false)
    const utxosPremix = walletService.getUtxosPremix().filter(a =>  a.lastActivityElapsed ? true : false)
    const utxosPostmix = walletService.getUtxosPostmix().filter(a =>  a.lastActivityElapsed ? true : false)
    let utxos = utxosDeposit.concat(utxosPremix).concat(utxosPostmix).sort((a,b) => a.lastActivityElapsed - b.lastActivityElapsed)
    return (
      <div className='lastActivityPage'>
        <div className='row'>
          <div className='col-sm-12'>
            <h2>Last activity <FontAwesomeIcon icon={Icons.faCircleNotch} spin size='xs' /></h2>
          </div>
        </div>
        <div className="tablescroll">
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
            </tr>
            </thead>
            <tbody>
            {utxos.map((utxo,i) => {
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
)(LastActivityPage);
