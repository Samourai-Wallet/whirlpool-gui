// @flow
import React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import walletService from '../../services/walletService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QRCode from 'qrcode.react';
import * as Icons from '@fortawesome/free-solid-svg-icons';

export default class DepositPage extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false,
      error: undefined,

      depositAddress: undefined
    };

    this.handleNextDepositAddress = this.handleNextDepositAddress.bind(this)

    // fetch deposit address
    this.doFetchDepositAddressAndShow()
  }

  doFetchDepositAddressAndShow(distinct=false) {
    const setState = depositAddressResponse => {
      this.setState({
        loaded: true,
        depositAddress: depositAddressResponse
      })
    }
    if (distinct) {
      return walletService.fetchDepositAddressDistinct(this.state.depositAddress).then(setState)
    } else {
      return walletService.fetchDepositAddress().then(setState)
    }
  }

  handleNextDepositAddress() {
    this.doFetchDepositAddressAndShow(true)
  }

  render() {
    return (
      <Modal show={true} onHide={this.props.onClose} dialogClassName="modal-deposit">
        <Modal.Header>
          <Modal.Title>Deposit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.loaded && this.state.error && (
            <Alert variant='danger'>{this.state.error}</Alert>
          )}
          {this.state.loaded && !this.state.error && (
            <div>
              Deposit funds to your deposit wallet:
              <div className='depositAddress'>
                <QRCode value={this.state.depositAddress} /><br/>
                <b>{this.state.depositAddress}</b> <a onClick={this.handleNextDepositAddress} title='Change deposit address'><FontAwesomeIcon icon={Icons.faRedo} /></a>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!this.state.loaded && <div className="modal-status">
            <div className="spinner-border spinner-border-sm" role="status"/> Fetching deposit address...
          </div>}
          <Button variant="secondary" onClick={this.props.onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
