// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cliService from '../services/cliService';
import { Alert } from 'react-bootstrap';

class LoginPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.state = {
      loginError: undefined
    }

    this.inputPassphrase = React.createRef()

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit() {
    const seedPassphrase = this.inputPassphrase.current.value
    cliService.login(seedPassphrase).then(() => {
        this.setState({
        loginError: undefined
      })
    })
      .catch(e => this.setState({
      loginError: e.message
    }))
  }

  render() {
    return (
      <form className="form-signin text-center" onSubmit={this.onSubmit}>
        <h1 className="h3 mb-3 font-weight-normal">Authentication</h1>
        <p>Your passphrase is required<br/>for Whirlpool startup.</p>
        <input type="password" id="seedPassphrase" className="form-control" placeholder="Wallet passphrase" ref={this.inputPassphrase} required autoFocus/>
        <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
        <br/>
        {this.state.loginError && <Alert variant='danger'>Authentication failed: {this.state.loginError}</Alert>}
      </form>
    )
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
)(LoginPage);
