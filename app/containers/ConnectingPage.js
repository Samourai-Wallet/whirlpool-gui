// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cliService from '../services/cliService';
import { Alert } from 'react-bootstrap';
import * as Icons from '@fortawesome/free-solid-svg-icons';

class ConnectingPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.reconnect = this.reconnect.bind(this)
    this.onResetConfig = this.onResetConfig.bind(this)
  }

  render() {
    const cliUrlError = cliService.getCliUrlError()
    if (cliUrlError) {
      return this.renderCliUrlError(cliUrlError)
    }
    return this.renderConnecting()
  }

  // connecting

  reconnect() {
    cliService.fetchState()
  }

  renderConnecting() {
    return (
      <form className="form-signin text-center" onSubmit={this.onSubmit}>
        <h1 className="h3 mb-3 font-weight-normal">Connecting...</h1>
        <div><FontAwesomeIcon icon={Icons.faCloud} size='3x' color='#343a40'/></div>
        <p>Connecting to whirlpool-cli<br/>
          <strong>{cliService.getCliUrl()}</strong>
        </p>

        {cliService.getCliMessage() && <Alert variant='info'>{cliService.getCliMessage()}</Alert>}
        <button type='button' className='btn btn-primary' onClick={this.reconnect}><FontAwesomeIcon icon={Icons.faSync} /> Retry to connect</button>
      </form>
    );
  }

  // connection failed

  onResetConfig() {
    if (confirm('This will reset GUI configuration. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  renderCliUrlError(cliUrlError) {
    return (

      <form className="form-signin text-center" onSubmit={this.onSubmit}>
        <h1 className="h3 mb-3 font-weight-normal">Connection failed</h1>
        <div><FontAwesomeIcon icon={Icons.faWifi} size='3x' color='#343a40'/></div>
        <p>Unable to connect to whirlpool-cli.<br/>
          <strong>{cliService.getCliUrl()}</strong><br/>
          Make sure it's running, or try restarting it.</p>

        <Alert variant='danger'>Connection failed: {cliUrlError}</Alert>
        <button type='button' className='btn btn-primary' onClick={this.reconnect}><FontAwesomeIcon icon={Icons.faSync} /> Retry to connect</button>
        <br/>

        <br/><br/><br/><br/>

        <p>You may want to reset GUI configuration.</p>
        <div className='text-center'>
          <button type='button' className='btn btn-danger btn-sm' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset GUI configuration</button>
        </div>
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
