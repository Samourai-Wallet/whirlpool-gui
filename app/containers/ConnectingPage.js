
// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cliService from '../services/cliService';
import { Alert } from 'react-bootstrap';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { cliLocalService } from '../services/cliLocalService';

class ConnectingPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.reconnect = this.reconnect.bind(this)
    this.onResetConfig = this.onResetConfig.bind(this)
  }

  render() {
    const cliUrlError = cliService.getCliUrlError() // or undefined
    return this.renderConnecting(cliUrlError)
  }

  // connecting

  reconnect() {
    cliService.fetchState()
  }

  renderConnecting(cliUrlError) {
    return (
      <form className="form-signin text-center" onSubmit={(e) => {this.onSubmit();e.preventDefault()}}>
        <h1 className="h3 mb-3 font-weight-normal">Connecting...</h1>
        <div><FontAwesomeIcon icon={Icons.faCloud} size='3x' color='#343a40'/></div><br/>
        <p>Connecting to whirlpool-cli<br/>
          <strong>{cliService.getCliUrl()}</strong></p>
        {cliService.isCliLocal() && <div>{cliLocalService.getStatusIcon((icon,text)=><span>{icon} {text}<br/>(might take a minute to start... restart if longer)</span>)}<br/><br/></div>}

        {cliService.getCliMessage() && <Alert variant='info'>{cliService.getCliMessage()}</Alert>}
        <button type='button' className='btn btn-primary' onClick={this.reconnect}><FontAwesomeIcon icon={Icons.faSync} /> Retry to connect</button>

        {cliUrlError && <div>
          <br/>
          <Alert variant='danger'>Connection failed: {cliUrlError}</Alert>
          <br/><br/><br/><br/>
          <p>You may want to reset GUI settings.</p>
          <div className='text-center'>
            <button type='button' className='btn btn-danger btn-sm' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
          </div>
        </div>}
      </form>
    );
  }

  // connection failed

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  renderCliUrlError() {
    return (

      <form className="form-signin text-center" onSubmit={(e) => {this.onSubmit();e.preventDefault()}}>
        <h1 className="h3 mb-3 font-weight-normal">Connecting...</h1>
        <div><FontAwesomeIcon icon={Icons.faWifi} size='3x' color='#343a40'/></div>
        <p>Connecting to whirlpool-cli...<br/>
          <strong>{cliService.getCliUrl()}</strong><br/>
          {cliService.isCliLocal() && <div>{cliLocalService.getStatusIcon((icon,text)=><span>{icon} {text}<br/>(might take a minute to start... restart if longer)</span>)}</div>}
        </p>


      </form>
    );
  }

}
function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectingPage);
