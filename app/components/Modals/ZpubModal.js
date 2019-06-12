// @flow
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QRCode from 'qrcode.react';
import AbstractModal from './AbstractModal';
import { Button } from 'react-bootstrap';

export default class ZpubModal extends AbstractModal {
  constructor(props) {
    const initialState = {}
    super(props, 'modal-zpub', initialState)
  }

  renderTitle() {
    return <span>ZPUB</span>
  }

  renderButtons() {
    return <div/>
  }

  renderBody() {
    return <div className='row'>
      <div className='col-sm-12'>
        This is your ZPUB for <strong>{this.props.account}</strong>. Keep it confidential.
        <div className='text-center'>
          <QRCode className='qr' value={this.props.zpub} /><br/>
          <b>{this.props.zpub}</b>
        </div>
      </div>
    </div>
  }
}
