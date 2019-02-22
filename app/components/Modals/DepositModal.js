// @flow
import React from 'react';
import walletService from '../../services/walletService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QRCode from 'qrcode.react';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import AbstractModal from './AbstractModal';
import { Button } from 'react-bootstrap';

export default class DepositPage extends AbstractModal {
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
      {!this.isLoading() && <Button onClick={this.handleNextDepositAddress}>Generate another address <FontAwesomeIcon icon={Icons.faRedo} /></Button>}
    </div>
  }

  renderBody() {
    return <div>
      {!this.isLoading() && !this.isError() && (
        <div>
          Deposit funds to your deposit wallet:
          <div className='depositAddress'>
            <QRCode value={this.state.depositAddress} /><br/>
            <b>{this.state.depositAddress}</b>
          </div>
        </div>
      )}
    </div>
  }
}
