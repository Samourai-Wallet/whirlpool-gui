// @flow
import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cliService from '../services/cliService';
import { CLI_CONFIG_FILENAME, DEFAULT_CLIPORT } from '../const';
import { cliLocalService } from '../services/cliLocalService';

const STEP_LAST = 2
const DEFAULT_CLIHOST = 'http://my-dojo-server'
const DEFAULT_APIKEY = ''
const CLILOCAL_URL = 'http://localhost:'+DEFAULT_CLIPORT
class InitPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.state = {
      step: 0,
      navNextStep: false,
      cliLocal: cliService.isCliLocal(),
      cliUrl: undefined,
      currentCliHost: DEFAULT_CLIHOST,
      currentCliPort: DEFAULT_CLIPORT,
      currentApiKey: DEFAULT_APIKEY,
      cliError: undefined,
      hasPairingPayload: false,
      pairingError: undefined,
      cliInitError: undefined
    }

    // configuration data
    this.hasPairingPayload = undefined
    this.pairingPayload = undefined

    this.inputCliHost = React.createRef()
    this.inputCliPort = React.createRef()
    this.inputApiKey = React.createRef()

    this.goNextStep = this.goNextStep.bind(this)
    this.goPrevStep = this.goPrevStep.bind(this)
    this.onChangeCliLocal = this.onChangeCliLocal.bind(this)
    this.onChangeInputCliHostPort = this.onChangeInputCliHostPort.bind(this)
    this.connectCli = this.connectCli.bind(this)
    this.onChangePairingPayload = this.onChangePairingPayload.bind(this)
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
    this.navNextStep = next

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

        <p>This will connect Whirlpool to Samourai Wallet.</p>

        {this.state.cliUrl && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Connected to whirlpool-cli: <strong>{this.state.cliLocal ? 'standalone' : this.state.cliUrl}</strong></div>}
        {this.state.hasPairingPayload && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Ready to pair with Samourai Wallet</div>}
        {this.state.step === STEP_LAST && <div><FontAwesomeIcon icon={Icons.faCheck} color='green' /> Configuration saved</div>}
        <br/>

        <form onSubmit={(e) => {
          if (this.navNextStep) {
            this.goNextStep();
          }
          e.preventDefault()
        }}>

        {this.state.step === 0 && this.step0()}

        {(this.state.step === 1 || this.state.step === 2) &&
          <div>
            {this.state.step === 1 && this.step1()}
          </div>
        }

        {this.state.step === STEP_LAST && this.step2()}
        </form>
      </div>
    );
  }

  // cli instance selection

  onChangeCliLocal(e) {
    const valueBool = e.target.value === 'true'
    cliService.setCliLocal(valueBool)
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
    this.resetPairingPayload()
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
      console.error('testCliUrl failed',error)
      this.setState({
        cliError: error.message
      })
    })
  }

  step0() {
    return <div>
      <div className="form-group row">
        <div className="col-sm-12">
          How do you want to use this GUI?
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="inputEmail3" className="col-sm-1 col-form-label"></label>
        <div className="col-sm-11">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="cliLocal" id="cliLocalTrue" value='true' checked={this.state.cliLocal} onChange={this.onChangeCliLocal}/>
            <label className="form-check-label" htmlFor="cliLocalTrue">
              <strong>Standalone GUI</strong>
            </label>
            {this.state.cliLocal && <div className="col-sm-12"><div className="row">
              {cliLocalService.getStatusIcon((icon,text)=><div className='col-sm-8'><Alert variant='success'>{icon} {text}</Alert></div>)}
              {cliLocalService.isValid() && <div className='col-sm-2'><button type='button' className='btn btn-primary' onClick={this.connectCli} disabled={!cliLocalService.isValid()}>Connect</button></div>}
              {!cliLocalService.isStatusDownloading() && !cliLocalService.isValid() && <div className='col-sm-12'><Alert variant='danger'>No valid CLI found. Please reinstall GUI.</Alert></div>}
            </div></div>}
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="cliLocal" id="cliLocalFalse" value='false' checked={!this.state.cliLocal} onChange={this.onChangeCliLocal} />
            <label className="form-check-label" htmlFor="cliLocalFalse">
              <strong>Connect to existing DOJO / CLI</strong><br/>
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

  // pairing

  resetPairingPayload() {
    this.pairingPayload = undefined
    this.setState({
      hasPairingPayload: false,
      pairingError: undefined,
      cliInitError: undefined
    })
  }

  onChangePairingPayload(payloadStr) {
    let payload = undefined
    try {
      payload = JSON.parse(payloadStr)
      console.log('payload', payload)
    } catch(e) {}
    if (payload && payload.pairing && Object.keys(payload.pairing).length > 0) {
      // seems valid
      this.pairingPayload = payloadStr
      this.setState({
        hasPairingPayload: true,
        pairingError: undefined
      })
    } else {
      // invalid payload
      console.error('Invalid payload: '+payloadStr)
      this.setState({
        hasPairingPayload: false,
        pairingError: 'Invalid payload'
      })
    }
  }

  onSubmitInitialize() {
    cliService.initializeCli(this.state.cliUrl, this.state.currentApiKey, this.state.cliLocal, this.pairingPayload).then(() => {
      // success!
      this.goNextStep()
    }).catch(error => {
      console.error('initialization failed', error)
      this.setState({
        cliInitError: error.message
      })
    })
  }

  step1() {
    return <div>
      <div className="form-group row">
        <div className="col-sm-1 text-right">
          <FontAwesomeIcon icon={Icons.faMobileAlt} size='6x'/>
        </div>
        <div className="col-sm-11">
          <div className="row">
            <div className="col-sm-12">
              Get your <strong>pairing payload</strong> in Samourai Wallet, go to <strong>Settings/Transactions/Experimental</strong><br/><br/>
              <input type="text" className='form-control form-control-lg' required autoFocus onChange={e => {
                  const myValue = e.target.value
                  this.onChangePairingPayload(myValue)
                }} onClick={e => {
                  e.target.value = ''
                  this.resetPairingPayload()
              }} defaultValue='' id="pairingPayload" placeholder='Paste your pairing payload here'/>
            </div>
            {this.state.pairingError && <div className="col-sm-12"><br/>
              <Alert variant='danger'>{this.state.pairingError}</Alert>
            </div>}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 text-center">
          {this.state.hasPairingPayload && <button type="button" className="btn btn-primary btn-lg" onClick={this.onSubmitInitialize}>Initialize GUI</button>}
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

  step2() {
    return <div>
      <p>Success. <b>whirlpool-gui</b> is now configured.</p>
      <p>Reconnecting to CLI...</p>
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
