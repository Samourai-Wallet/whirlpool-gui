// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/walletActions';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import mixService from '../services/mixService';
import poolsService from '../services/poolsService';
import UtxosTable from '../components/Utxo/UtxosTable';

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
        <div className='row h-100 d-flex flex-column'>
          <div className='col-sm-12 flex-grow-1 tablescroll'>
            <UtxosTable utxos={utxos} controls={false} account={true}/>
          </div>
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
