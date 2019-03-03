// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cliService from '../services/cliService';
import { Alert } from 'react-bootstrap';

class ConnectingPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

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

  renderConnecting() {
    return (
      <div>
        <h1>Connecting...</h1>
        <p>Connecting to whirlpool-cli: <strong>{cliService.getCliUrl()}</strong>...</p>
      </div>
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
      <div>
        <h1>Connection failed</h1>

        Unable to connect to whirlpool-cli: <strong>{cliService.getCliUrl()}</strong>
        <Alert variant='danger'>Connection failed: {cliUrlError}</Alert>

        <div className='text-center'>
          <button type='button' className='btn btn-danger' onClick={this.onResetConfig}>Reset GUI configuration</button>
        </div>
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
    dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectingPage);
