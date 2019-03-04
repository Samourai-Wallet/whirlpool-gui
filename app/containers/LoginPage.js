// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cliService from '../services/cliService';

class LoginPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <form className="form-signin text-center">
        <img className="mb-4" src="/docs/4.3/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72"/>
        <h1 className="h3 mb-3 font-weight-normal">Authentication</h1>
        <p>Whirlpool wallet is closed. <br/>Your passphrase is required for startup.</p>
        <input type="password" id="seedPassphrase" className="form-control" placeholder="Wallet passphrase" required autoFocus/>
        <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
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
