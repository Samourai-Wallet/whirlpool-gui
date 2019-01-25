// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { connect } from 'react-redux';

class InitPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      setupMode: 'local'
    }
    this.handleOptionChange = this.handleOptionChange.bind(this)
  }

  handleOptionChange(changeEvent) {
    const value = changeEvent.target.value
    console.log('handleOptionChange: '+value)
    this.setState({
      setupMode: value
    });
  }

  render() {
    const goNextStep = () => this.setState({step: this.state.step+1})
    const goPrevStep = () => this.setState({step: this.state.step-1})
    const STEP_LAST = 3


    return (
      <div>
        <h1>First run</h1>

        {this.state.step === 0 &&
        <form onSubmit={goNextStep}>
          <p>Welcome to <b>whirlpool-gui</b> configuration wizard.</p>
          <div className="form-group row">
            <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Setup mode</label>
            <div className="col-sm-10">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="local" checked={this.state.setupMode === 'local'} onChange={this.handleOptionChange}/>
                  <label className="form-check-label" htmlFor="exampleRadios1">
                    Run whirlpool locally
                  </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="remote" checked={this.state.setupMode === 'remote'} onChange={this.handleOptionChange} />
                  <label className="form-check-label" htmlFor="exampleRadios2">
                    Connect to your existing DOJO / whirlpool-client-cli<br/>
                    {this.state.setupMode === 'remote' &&
                      <div className="row">
                        <div className="col-sm-7">
                          <input type="text" className="form-control" id="inputEmail3" placeholder="host" required/>
                        </div>
                        <div className="col-sm-3">
                         <input type="number" className="form-control" id="inputEmail3" placeholder="port" value={8082} required/>
                        </div>
                      </div>
                    }
                  </label>
              </div>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
              {this.state.step > 0 && <a onClick={goPrevStep}>
                <i className="fa fa-arrow-left fa-3x" />
              </a>}
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn"> <i className="fa fa-arrow-right fa-3x" /></button>
            </div>
          </div>
        </form>
        }

        {this.state.step === 1 &&
        <form onSubmit={goNextStep}>
          <p>This will connect whirlpool to your existing Samourai Wallet.<br/>
          Your passphrase will be required for each whirlpool startup.</p>
          <div className="form-group row">
            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Passphrase</label>
            <div className="col-sm-10">
              <input type="password" className="form-control" id="inputPassword3" placeholder="Enter your existing wallet's passphrase" required autoFocus/>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
              {this.state.step > 0 && <a onClick={goPrevStep}>
                <i className="fa fa-arrow-left fa-3x" />
              </a>}
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn"> <i className="fa fa-arrow-right fa-3x" /></button>
            </div>
          </div>
        </form>
        }

        {this.state.step === 2 &&
        <form onSubmit={goNextStep}>
          <p>This will connect whirlpool to your existing Samourai Wallet.<br/>
            Your seed will be encrypted in ./whirlpool-client-cli.conf. <b>whirlpool-gui will never ask again for it.</b></p>
          <div className="form-group row">
            <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Seed words</label>
            <div className="col-sm-10">
              <input type="password" className="form-control" id="inputEmail3" placeholder="Enter your existing wallet's seed (12 words)" required autoFocus/>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
              {this.state.step > 0 && <a onClick={goPrevStep}>
                <i className="fa fa-arrow-left fa-3x" />
              </a>}
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn"> <i className="fa fa-arrow-right fa-3x" /></button>
            </div>
          </div>
        </form>
        }

        {this.state.step === STEP_LAST &&
        <div>
          <p>Configuration success. <b>whirlpool-gui</b> is now configured.</p>
          <Link to={routes.STATUS}><button type="button" className="btn btn-primary">Start Whirlpool</button></Link>
        </div>
        }
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
)(InitPage);
