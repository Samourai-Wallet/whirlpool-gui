// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as CounterActions from '../actions/counter';

function mapStateToProps(state) {
  return {
    counter: state.counter
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}

class InitPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)
    this.state = {
      step: 0
    }
  }

  render() {
    const goNextStep = () => this.setState({step: this.state.step+1})
    const goPrevStep = () => this.setState({step: this.state.step-1})

    return (
      <div>
        <h1>First run</h1>

        {this.state.step !== 2 &&
          <p>Welcome to <b>whirlpool-gui</b> configuration wizard.<br/>
          Follow these steps to connect to your existing Samourai Wallet.</p>
        }

        {this.state.step === 0 &&
        <form onSubmit={goNextStep}>
          <div className="form-group row">
            <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Seed words</label>
            <div className="col-sm-10">
              <input type="password" className="form-control" id="inputEmail3" placeholder="Enter your existing wallet's seed (12 words)" required autoFocus/>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn"> <i className="fa fa-arrow-right fa-3x" /></button>
            </div>
          </div>
        </form>
        }

        {this.state.step === 1 &&
        <form onSubmit={goNextStep}>
          <div className="form-group row">
            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Passphrase</label>
            <div className="col-sm-10">
              <input type="password" className="form-control" id="inputPassword3" placeholder="Enter your existing wallet's passphrase" required autoFocus/>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
              <a onClick={goPrevStep}>
                <i className="fa fa-arrow-left fa-3x" />
              </a>
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn"> <i className="fa fa-arrow-right fa-3x" /></button>
            </div>
          </div>
        </form>
        }

        {this.state.step === 2 &&
        <div>
          <p>Success, <b>whirlpool-gui</b> is now configured.<br/>
            Your seed has been encrypted in ./whirlpool-gui.conf. Your passphrase will be required for each GUI startup.<br/><br/>
            <b>This app will never ask for your seed, you should never type it again on this app.</b>
          </p>
          <Link to={routes.STATUS}><button type="button" className="btn btn-primary">Start Whirlpool</button></Link>
        </div>
        }
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InitPage);
