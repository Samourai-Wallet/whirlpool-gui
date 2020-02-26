// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cliService from '../services/cliService';
import { Alert } from 'react-bootstrap';
import * as Icons from "@fortawesome/free-solid-svg-icons";
import utils from '../services/utils';

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
    this.setState({
      loginError: undefined
    })
    const seedPassphrase = this.inputPassphrase.current.value
    cliService.login(seedPassphrase).catch(e => this.setState({
      loginError: e.message
    }))
  }

  render() {
    return (
      <form className="form-signin text-center" onSubmit={(e) => {this.onSubmit();e.preventDefault()}}>
        <h1 className="h3 mb-3 font-weight-normal">Authentication</h1>
        <div><FontAwesomeIcon icon={Icons.faLock} size='3x' color='#343a40'/></div><br/>
        <p>Your passphrase is required<br/>for opening wallet.</p>
        <input type="password" id="seedPassphrase" className="form-control" placeholder="Wallet passphrase" ref={this.inputPassphrase} required autoFocus/>
        <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
        <br/>
        {cliService.isTor() && <div>
          {utils.torIcon()} Please be patient signing in with Tor<br/><br/></div>}
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
