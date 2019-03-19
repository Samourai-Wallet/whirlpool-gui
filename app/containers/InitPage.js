// @flow
import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SeedSelector from '../components/SeedSelector/seedSelector';
import txt from 'raw-loader!../resources/en_US.txt';
import encryptUtils from '../services/encryptUtils';
import cliService from '../services/cliService';
import { CLI_CONFIG_FILENAME } from '../services/utils';
import { DEFAULT_CLI_LOCAL } from '../const';

const STEP_LAST = 3
const DEFAULT_CLIHOST = 'http://my-dojo-server'
const DEFAULT_CLIPORT = 8899
const DEFAULT_APIKEY = ''
const CLILOCAL_URL = 'http://localhost:'+DEFAULT_CLIPORT
class InitPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.state = {
      step: 0,
      cliLocal: DEFAULT_CLI_LOCAL,
      cliUrl: undefined,
      currentCliHost: DEFAULT_CLIHOST,
      currentCliPort: DEFAULT_CLIPORT,
      currentApiKey: DEFAULT_APIKEY,
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
    this.inputApiKey = React.createRef()

    this.goNextStep = this.goNextStep.bind(this)
    this.goPrevStep = this.goPrevStep.bind(this)
    this.onChangeCliLocal = this.onChangeCliLocal.bind(this)
    this.onChangeInputCliHostPort = this.onChangeInputCliHostPort.bind(this)
    this.connectCli = this.connectCli.bind(this)
    this.onChangePassphrase = this.onChangePassphrase.bind(this)
    this.onSubmitEncryptedSeedWords = this.onSubmitEncryptedSeedWords.bind(this)
    this.encryptSeedWords = this.encryptSeedWords.bind(this)
    this.onSubmitInitialize = this.onSubmitInitialize.bind(this)
  }

  goNextStep () {
    this.goStep(this.state.step+1)
  }

  goPrevStep () {
    this.goStep(this.state.step-1)
  }

  goStep (i) {
    this.setState({step: i})
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
        <h1>Whirlpool setup</h1>

        <p>This will connect Whirlpool to your existing Samourai Wallet.</p>

        {this.state.cliUrl && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Connected to whirlpool-cli: {this.state.cliUrl}</div>}
        {this.state.hasPassphrase && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Passphrase set for seed encryption</div>}
        {this.state.hasEncryptedSeedWords && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Seed encrypted</div>}
        {this.state.step === STEP_LAST && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Configuration saved</div>}
        <br/>

        <form onSubmit={(e) => {this.goNextStep();e.preventDefault()}}>

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

  onChangeCliLocal(e) {
    const valueBool = e.target.value === 'true'
    this.setState({
      cliLocal: valueBool
    });
    this.resetCliUrl()
  }

  resetCliUrl() {
    this.setState({
      cliUrl: undefined,
      cliError: undefined,
      currentCliHost: DEFAULT_CLIHOST,
      currentCliPort: DEFAULT_CLIPORT,
      currentApiKey: DEFAULT_APIKEY,
    });
    this.resetPassphrase()
  }

  onChangeInputCliHostPort(e) {
    this.resetCliUrl()
    this.setState({
      currentCliHost: this.inputCliHost.current.value,
      currentCliPort: this.inputCliPort.current.value,
      currentApiKey: this.inputApiKey.current.value
    })
  }

  computeCliUrl() {
    const cliUrlRemote = this.state.currentCliHost+':'+this.state.currentCliPort
    const cliUrl = (this.state.cliLocal ? CLILOCAL_URL:cliUrlRemote)
    return cliUrl
  }

  connectCli() {
    const cliUrl = this.computeCliUrl()
    const apiKey = this.state.currentApiKey
    const cliLocal = this.state.cliLocal

    cliService.testCliUrl(cliUrl, apiKey).then(cliStatusReady => {
      // connection success
      this.setState({
        cliUrl: cliUrl,
        cliError: undefined
      })

      if (cliStatusReady) {
        // CLI already initialized => save configuration & finish
        cliService.saveConfig(cliUrl, apiKey, cliLocal)
        this.goStep(STEP_LAST)
      }
      else {
        // CLI not initialized yet => continue configuration
        this.goNextStep()
      }
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
          <div className="form-check">
            <input className="form-check-input" type="radio" name="cliLocal" id="cliLocalTrue" value='true' checked={this.state.cliLocal} onChange={this.onChangeCliLocal}/>
            <label className="form-check-label" htmlFor="cliLocalTrue">
              Run whirlpool locally
            </label>
            {this.state.cliLocal && <div className="col-sm-3">
              <button type='button' className='btn btn-primary' onClick={this.connectCli}>Connect</button>
            </div>}
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="cliLocal" id="cliLocalFalse" value='false' checked={!this.state.cliLocal} onChange={this.onChangeCliLocal} />
            <label className="form-check-label" htmlFor="cliLocalFalse">
              Connect to your existing DOJO / CLI<br/>
              {!this.state.cliLocal &&
              <div className="row">
                <div className="col-sm-5">
                  <input type="text" className="form-control" placeholder="host" defaultValue={this.state.currentCliHost} ref={this.inputCliHost} onChange={this.onChangeInputCliHostPort} required/>
                </div>
                <div className="col-sm-2">
                  <input type="number" className="form-control" placeholder="port" defaultValue={this.state.currentCliPort} ref={this.inputCliPort} onChange={this.onChangeInputCliHostPort} required/>
                </div>
                <div className="col-sm-2">
                  <input type="password" className="form-control" placeholder="apiKey" defaultValue={this.state.currentApiKey} ref={this.inputApiKey} onChange={this.onChangeInputCliHostPort} />
                </div>
                <div className="col-sm-3">
                  {this.state.currentCliHost && this.state.currentCliPort
                  && !this.state.cliUrl && <button type='button' className='btn btn-primary' onClick={this.connectCli}>Connect</button>}
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
    cliService.initializeCli(this.state.cliUrl, this.state.currentApiKey, this.encryptedSeedWords).then(() => {
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
            Your seed will be encrypted in ./{CLI_CONFIG_FILENAME}. <b>whirlpool will never ask again for it.</b>
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
      {cliService.isCliLocal() && <p>Restarting local CLI... This will take a few seconds</p>}
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
