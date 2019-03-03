// @flow
import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SeedSelector from '../components/SeedSelector/seedSelector';
import txt from 'raw-loader!../resources/en_US.txt';
import encryptUtils from '../services/encryptUtils';
import backendService from '../services/backendService';
import cliService from '../services/cliService';
import { statusActions } from '../services/statusActions';

const STEP_LAST = 3
const CLI_URL_LOCAL = 'LOCAL'
const SETUP_MODE = {
  LOCAL:'LOCAL',
  REMOTE:'REMOTE'
}
class InitPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      setupMode: SETUP_MODE.REMOTE,
      cliUrl: undefined,
      cliError: undefined,
      hasPassphrase: false,
      hasEncryptedSeedWords: false,
      cliInitError: undefined
    }
    this.words = txt.trim().split('\n')

    // configuration data
    this.passphrase = undefined
    this.encryptedSeedWords = undefined

    this.inputCliHost = React.createRef()
    this.inputCliPort = React.createRef()

    this.goNextStep = this.goNextStep.bind(this)
    this.goPrevStep = this.goPrevStep.bind(this)
    this.onChangeSetupMode = this.onChangeSetupMode.bind(this)
    this.onChangeInputCliHostPort = this.onChangeInputCliHostPort.bind(this)
    this.connectCliRemote = this.connectCliRemote.bind(this)
    this.onChangePassphrase = this.onChangePassphrase.bind(this)
    this.onSubmitEncryptedSeedWords = this.onSubmitEncryptedSeedWords.bind(this)
    this.encryptSeedWords = this.encryptSeedWords.bind(this)
    this.onSubmitInitialize = this.onSubmitInitialize.bind(this)
  }

  goNextStep () {
    this.setState({step: this.state.step+1})
  }

  goPrevStep () {
    this.setState({step: this.state.step-1})
  }

  navButtons(next=true,previous=true) {

    return <div className="form-group row">
      <div className="col-sm-5">
        {previous && this.state.step > 0 && <button type="button" className="btn btn-default" onClick={this.goPrevStep}><FontAwesomeIcon icon={Icons.faArrowLeft} /></button>}
      </div>
      <div className="col-sm-5">
        {next && <button type="submit" className="btn btn-primary"> Continue <FontAwesomeIcon icon={Icons.faArrowRight} /></button>}
      </div>
    </div>
  }

  render() {
    return (
      <div>
        <h1>First run</h1>

        <p>Welcome to Whirlpool setup.
          This will connect Whirlpool to your existing Samourai Wallet.</p>

        {this.state.cliUrl && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Connected to whirlpool-cli: {this.state.cliUrl}</div>}
        {this.state.hasPassphrase && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Passphrase set for seed encryption</div>}
        {this.state.hasEncryptedSeedWords && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Seed encrypted</div>}
        {this.state.step === STEP_LAST && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Configuration saved</div>}
        <br/>

        <form onSubmit={this.goNextStep}>

        {this.state.step === 0 && this.step0()}

        {(this.state.step === 1 || this.state.step === 2) &&
          <div>
            {this.state.step === 1 && this.step1()}
            {this.state.step === 2 && this.step2()}
          </div>
        }

        {this.state.step === STEP_LAST && this.step3()}
        </form>
      </div>
    );
  }

  // cli instance selection

  onChangeSetupMode(e) {
    this.setState({
      setupMode: e.target.value
    });
    this.resetCliUrl()
  }

  resetCliUrl() {
    this.setState({
      cliUrl: undefined,
      cliError: undefined
    });
    this.resetPassphrase()
  }

  onChangeInputCliHostPort(e) {
    this.resetCliUrl()
  }

  connectCliRemote(host, port) {
    const cliUrl = host+':'+port

    cliService.testCliUrl(cliUrl).then(() => {
      this.setState({
        cliUrl: cliUrl,
        cliError: undefined
      })
      this.goNextStep()
    }).catch(error => {
      this.setState({
        cliError: error.message
      })
    })
  }

  step0() {
    return <div>
      <div className="form-group row">
        <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Setup mode</label>
        <div className="col-sm-10">
          {false && <div className="form-check">
            <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value={SETUP_MODE.LOCAL} checked={this.state.setupMode === SETUP_MODE.LOCAL} onChange={this.onChangeSetupMode}/>
            <label className="form-check-label" htmlFor="exampleRadios1">
              Run whirlpool locally
            </label>
          </div>}
          <div className="form-check">
            <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value={SETUP_MODE.REMOTE} checked={this.state.setupMode === SETUP_MODE.REMOTE} onChange={this.onChangeSetupMode} />
            <label className="form-check-label" htmlFor="exampleRadios2">
              Connect to your existing DOJO / whirlpool-client-cli<br/>
              {this.state.setupMode === SETUP_MODE.REMOTE &&
              <div className="row">
                <div className="col-sm-6">
                  <input type="text" className="form-control" id="inputEmail3" placeholder="host" defaultValue='http://localhost' ref={this.inputCliHost} onChange={this.onChangeInputCliHostPort} required/>
                </div>
                <div className="col-sm-3">
                  <input type="number" className="form-control" id="inputEmail3" placeholder="port" defaultValue={8899} ref={this.inputCliPort} onChange={this.onChangeInputCliHostPort} required/>
                </div>
                <div className="col-sm-3">
                  {this.inputCliHost.current && this.inputCliHost.current.value
                  && this.inputCliPort.current && this.inputCliPort.current.value
                  && !this.state.cliUrl && <button type='button' className='btn btn-default' onClick={() => this.connectCliRemote(this.inputCliHost.current.value, this.inputCliPort.current.value)}>Connect</button>}
                </div>
              </div>
              }
            </label>
          </div>
        </div>
      </div>
      {this.state.cliError && <div className="row">
        <div className="col-sm-12">
          <Alert variant='danger'>Connection failed: {this.state.cliError}</Alert>
        </div>
      </div>}
      {this.navButtons(this.state.cliUrl ? true : false)}
    </div>
  }

  // passphrase selection

  onChangePassphrase(e) {
    this.passphrase = e.target.value
    this.setState({
      hasPassphrase: true
    })
    this.resetEncryptedSeedWords()
  }

  resetPassphrase() {
    this.passphrase = undefined
    this.setState({
      hasPassphrase: false
    })
    this.resetEncryptedSeedWords()
  }

  resetEncryptedSeedWords() {
    this.encryptedSeedWords = undefined
    this.setState({
      hasEncryptedSeedWords: false,
      cliInitError: undefined
    })
  }

  step1() {
    return <div>
      <div className="row">
        <div className="col-sm-12">
          <Alert variant='info'>
            Your passphrase is used to encrypt your wallet seed, but won't be stored.<br/>
            Your passphrase is required for each whirlpool startup.
          </Alert>
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Passphrase</label>
        <div className="col-sm-10">
          <input type="password" className="form-control" id="inputPassword3" placeholder="Enter your existing wallet's passphrase" required autoFocus onChange={this.onChangePassphrase}/>
        </div>
      </div>
      {this.navButtons(this.state.hasPassphrase ? true : false)}
    </div>
  }

  // seed words selection

  onSubmitEncryptedSeedWords(encryptedSeedWords) {
    console.log('encryptedSeedWords',encryptedSeedWords)
    this.encryptedSeedWords = encryptedSeedWords
    this.setState({
      hasEncryptedSeedWords: true
    })
  }

  encryptSeedWords(seedWords) {
    return encryptUtils.encrypt(this.passphrase,seedWords)
  }

  onSubmitInitialize() {
    cliService.initializeCli(this.state.cliUrl, this.encryptedSeedWords).then(() => {
      // success!
      this.goNextStep()
    }).catch(error => {
      this.setState({
        cliInitError: error.message
      })
    })
  }

  step2() {
    return <div>
      <div className="row">
        <div className="col-sm-12">
          <Alert variant='info'>
            Your seed will be encrypted in ./whirlpool-client-cli.conf. <b>whirlpool will never ask again for it.</b>
          </Alert>
        </div>
      </div>
      <div className="form-group row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header">
              Seed selection
            </div>
            <div className="card-body">
              <SeedSelector words={this.words} encrypt={this.encryptSeedWords} onSubmit={this.onSubmitEncryptedSeedWords}/>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 text-center">
          {this.encryptedSeedWords && <button type="button" className="btn btn-primary" onClick={this.onSubmitInitialize}>Initialize whirlpool-cli</button>}
        </div>
      </div>
      {this.state.cliInitError && <div className="row">
        <div className="col-sm-12">
          <Alert variant='danger'>Initialization failed: {this.state.cliInitError}</Alert>
        </div>
      </div>}
      {this.navButtons(false)}
    </div>
  }

  step3() {
    return <div>
      <p>Success. <b>whirlpool-gui</b> is now configured.</p>
      <button type="button" className="btn btn-primary">Start Whirlpool</button>
    </div>
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
