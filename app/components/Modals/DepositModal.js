// @flow
import React from 'react';
import walletService from '../../services/walletService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QRCode from 'qrcode.react';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import AbstractModal from './AbstractModal';
import { Button } from 'react-bootstrap';
import poolsService from '../../services/poolsService';
import utils from '../../services/utils';

export default class DepositModal extends AbstractModal {
  constructor(props) {
    const initialState = {
      depositAddress: undefined
    }
    super(props, 'modal-deposit', initialState)

    this.handleNextDepositAddress = this.handleNextDepositAddress.bind(this)

    // fetch deposit address
    this.doFetchDepositAddressAndShow()
  }

  doFetchDepositAddressAndShow(distinct=false) {
    const setState = depositAddressResponse => {
      this.setState({
        depositAddress: depositAddressResponse
      })
    }
    if (distinct) {
      this.loading("Fetching another deposit address...", walletService.fetchDepositAddressDistinct(this.state.depositAddress).then(setState))
    } else {
      this.loading("Fetching deposit address...", walletService.fetchDepositAddress().then(setState))
    }
  }

  handleNextDepositAddress() {
    this.doFetchDepositAddressAndShow(true)
  }

  renderTitle() {
    return <span>Deposit</span>
  }

  renderButtons() {
    return <div>
      {!this.isLoading() && <Button onClick={this.handleNextDepositAddress}>Renew address <FontAwesomeIcon icon={Icons.faRedo} /></Button>}
    </div>
  }

  renderBody() {
    return <div>
      {!this.isLoading() && !this.isError() && (
        <div>
          <div className='row'>
            <div className='col-sm-12'>
              Deposit funds to your deposit wallet:
              <div className='text-center'>
                <QRCode className='qr' value={this.state.depositAddress} /><br/>
                <b>{this.state.depositAddress}</b>
              </div><br/>
            </div>
          </div>
          <div className='row'>
            <div className='col-sm-2'></div>
            <div className='col-sm-8'>
              <table className='pools table table-sm text-center'>
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Denomination</th>
                  <th>Min. deposit</th>
                </tr>
                </thead>
                <tbody>
                {poolsService.getPoolsAvailable().map((pool,i) => <tr key={i}>
                  <td>{pool.poolId}</td>
                  <td>{utils.toBtc(pool.denomination)}</td>
                  <td>{utils.toBtc(pool.tx0BalanceMin)}</td>
                </tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <div className='col-sm-2'></div>
        </div>
      )}
    </div>
  }
}
