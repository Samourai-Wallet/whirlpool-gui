// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import poolsService from '../services/poolsService';
import utils from '../services/utils';

class PoolsPage extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    if (!poolsService.isReady()) {
      return <small>Fetching pools...</small>
    }

    return (
      <div className='poolsPage'>
        <div className='row'>
          <div className='col-sm-12'>
            <h2>Pools</h2>
          </div>
        </div>

        <table className='pools table text-center'>
          <thead>
          <tr>
            <th>Name</th>
            <th>Denomination</th>
            <th>Min. deposit</th>
            <th>Max. deposit</th>
            <th>Max. mixs</th>
            <th>Anonymity set per mix</th>
            <th>Whirlpool fee</th>
          </tr>
          </thead>
          <tbody>
          {poolsService.getPools().map((pool,i) => <tr key={i}>
            <td>{pool.poolId}</td>
            <td>{utils.toBtc(pool.denomination)}</td>
            <td>{utils.toBtc(pool.tx0BalanceMin)}</td>
            <td>∞</td>
            <td>∞</td>
            <td>{pool.mixAnonymitySet}</td>
            <td>{utils.toBtc(pool.feeValue)}</td>
          </tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PoolsPage);
