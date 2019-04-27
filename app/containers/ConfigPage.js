// @flow
import React, { Component } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { WHIRLPOOL_SERVER } from '../const';
import { logger } from '../utils/logger';
import { CliConfigService } from '../services/cliConfigService';
import utils from '../services/utils';
import poolsService from '../services/poolsService';
import cliService from '../services/cliService';

type Props = {};

const SERVER_MAIN = 'MAIN'
export default class ConfigPage extends Component<Props> {

  constructor(props) {
    super(props)

    this.state = {
      info: undefined,
      error: undefined,
      cliConfig: undefined,
      showDevelopersConfig: false
    }

    this.cliConfigService = new CliConfigService(cliConfig => this.setState({
      cliConfig: cliConfig
    }))

    this.onResetConfig = this.onResetConfig.bind(this)
    this.onChangeCliConfig = this.onChangeCliConfig.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.toogleDevelopersConfig = this.toogleDevelopersConfig.bind(this)
  }

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  onChangeCliConfig(set) {
    const cliConfig = this.state.cliConfig
    set(this.state.cliConfig)

    this.setState({
      cliConfig: cliConfig
    })
  }

  onSubmit(e) {
    this.cliConfigService.save(this.state.cliConfig).then(() => {
      logger.info('Configuration updated')
      this.setState({
        info: 'Configuration saved',
        error: undefined
      })
    }).catch(e => {
      logger.error('', e)
      this.setState({
        info: undefined,
        error: e.message
      })
    })
  }

  toogleDevelopersConfig() {
    this.setState({
      showDevelopersConfig: !this.state.showDevelopersConfig
    })
  }

  render() {
    if (!this.state.cliConfig) {
      return <small>Fetching CLI configuration...</small>
    }
    const cliConfig = this.state.cliConfig
    if (!cliConfig.mix) {
      cliConfig.mix = {}
    }
    const myThis = this
    const checked = e => {
      return e.target.checked
    }
    const poolIdValue = cliConfig.mix.poolIdsByPriority ? cliConfig.mix.poolIdsByPriority[0] : ''
    const ALL_POOLS_LABEL = 'All pools'
    const autoAggregatePostmixPossible = cliConfig.mix.autoTx0 && cliConfig.server !== SERVER_MAIN
    return (
      <div>
        <h1>Configuration</h1>

        <form onSubmit={(e) => {this.onSubmit(e);e.preventDefault()}}>
          <div className="form-group row">
            <div className="col-sm-12">
              {this.state.error && <Alert variant='danger'>{this.state.error}</Alert>}
              {this.state.info && <Alert variant='success'>{this.state.info}</Alert>}
            </div>
          </div>

          <Card>
            <Card.Header>General configuration</Card.Header>
            <Card.Body>
              <div className="form-group row">
                <label htmlFor="server" className="col-sm-2 col-form-label">Server</label>
                <select className="col-sm-8 form-control" id="server" onChange={e => {
                  const myValue = e.target.value
                  myThis.onChangeCliConfig(cliConfig => cliConfig.server = myValue)
                  if (myValue !== SERVER_MAIN) {
                    myThis.onChangeCliConfig(cliConfig => cliConfig.mix.autoAggregatePostmix = false)
                  }
                }} defaultValue={cliConfig.server}>
                  {Object.keys(WHIRLPOOL_SERVER).map((value) => <option value={value} key={value}>{WHIRLPOOL_SERVER[value]}</option>)}
                </select>
              </div>

              <div className="form-group row">
                <label htmlFor="pools" className="col-sm-2 col-form-label">Pool</label>
                {poolsService.isReady() && <select className="col-sm-8 form-control" id="pools" onChange={e => myThis.onChangeCliConfig(cliConfig => {
                  const value = e.target.value
                  cliConfig.mix.poolIdsByPriority = [value]
                })} defaultValue={poolIdValue}>
                  <option value=''>{ALL_POOLS_LABEL}</option>
                  {poolsService.getPoolsAvailable().map(pool => <option key={pool.poolId} value={pool.poolId}>{pool.poolId} (denomination: {utils.toBtc(pool.denomination)}btc, fee: {utils.toBtc(pool.feeValue)}, anonymity set: {pool.mixAnonymitySet})</option>)}
                </select>}
                {!poolsService.isReady() && <div className='col-sm-10'>
                  <strong>{poolIdValue ? poolIdValue : ALL_POOLS_LABEL}</strong> <small><i><a href='#'>Please login to edit pools</a></i></small>
                </div>}
              </div>

              <div className="form-group row">
                <label htmlFor="autoMix" className="col-sm-2 col-form-label">Auto-MIX</label>
                <div className="col-sm-10 custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeCliConfig(cliConfig => cliConfig.mix.autoMix = checked(e))} defaultChecked={cliConfig.mix.autoMix} id="autoMix"/>
                  <label className="custom-control-label" htmlFor="autoMix">Automatically QUEUE unmixed premix & postmix</label>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="autoTx0" className="col-sm-2 col-form-label">Auto-TX0</label>
                <div className="col-sm-10 custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" onChange={e => {
                    const myValue = checked(e)
                    myThis.onChangeCliConfig(cliConfig => cliConfig.mix.autoTx0 = myValue)
                    if (!myValue) {
                      myThis.onChangeCliConfig(cliConfig => cliConfig.mix.autoAggregatePostmix = false)
                    }
                  }} defaultChecked={cliConfig.mix.autoTx0} id="autoTx0"/>
                  <label className="custom-control-label" htmlFor="autoTx0">Automatically TX0 whole deposit account (otherwise, you can click "TX0" on deposit UTXOs)</label>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="mixsTarget" className="col-sm-2 col-form-label">Default mixs target</label>
                <div className="col-sm-10">
                  <div className='row'>
                    <input type="number" className='form-control col-sm-1' onChange={e => {
                      const myValue = parseInt(e.target.value)
                      myThis.onChangeCliConfig(cliConfig => cliConfig.mix.mixsTarget = myValue)
                    }} defaultValue={cliConfig.mix.mixsTarget} id="mixsTarget"/>
                    <label className='col-form-label col-sm-11'>Default number of mixs to complete for new UTXOs</label>
                  </div>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="tor" className="col-sm-2 col-form-label">TOR</label>
                <div className="col-sm-10">
                  <div className="custom-control custom-switch">
                    <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeCliConfig(cliConfig => cliConfig.tor = checked(e))} defaultChecked={cliConfig.tor} id="tor"/>
                    <label className="custom-control-label" htmlFor="tor">Route all traffic to TOR</label>
                  </div>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="proxy" className="col-sm-2 col-form-label">Proxy</label>
                <div className="col-sm-10">
                  <div className='row'>
                    <input type="text" className='form-control col-sm-4' onChange={e => {
                      const myValue = e.target.value
                      myThis.onChangeCliConfig(cliConfig => cliConfig.proxy = myValue)
                    }} defaultValue={cliConfig.proxy} id="proxy"/>
                    <label className='col-form-label col-sm-8'>
                      Connect through SOCKS/HTTP proxy.<br/>
                      <small>Tor proxy: socks://localhost:9050<br/>
                      Tor Browser: socks://localhost:9150<br/>
                      HTTP proxy: http://your-proxy:8080</small>
                    </label>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          <small><a onClick={this.toogleDevelopersConfig} style={{cursor:'pointer'}}>Toggle developers settings</a></small><br/>
          <br/>

          {this.state.showDevelopersConfig && <Card>
            <Card.Header>Developers settings</Card.Header>
            <Card.Body>
              <div className="form-group row">
                <label htmlFor="clients" className="col-sm-2 col-form-label">Max clients</label>
                <div className="col-sm-10">
                  <div className='row'>
                    <input type="number" className='form-control col-sm-1' onChange={e => {
                      const myValue = parseInt(e.target.value)
                      myThis.onChangeCliConfig(cliConfig => cliConfig.mix.clients = myValue)
                    }} defaultValue={cliConfig.mix.clients} id="clients"/>
                    <label className='col-form-label col-sm-11'>Max simultaneous mixing clients</label>
                  </div>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="clientDelay" className="col-sm-2 col-form-label">Client delay</label>
                <div className="col-sm-10">
                  <div className='row'>
                    <input type="number" className='form-control col-sm-1' onChange={e => {
                      const myValue = parseInt(e.target.value)
                      myThis.onChangeCliConfig(cliConfig => cliConfig.mix.clientDelay = myValue)
                    }} defaultValue={cliConfig.mix.clientDelay} id="clientDelay"/>
                    <label className='col-form-label col-sm-11'>Delay between each client connection</label>
                  </div>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="tx0MaxOutputs" className="col-sm-2 col-form-label">TX0 max outputs</label>
                <div className="col-sm-10">
                  <div className='row'>
                    <input type="number" className='form-control col-sm-1' onChange={e => {
                      const myValue = parseInt(e.target.value)
                      myThis.onChangeCliConfig(cliConfig => cliConfig.mix.tx0MaxOutputs = myValue)
                    }} defaultValue={cliConfig.mix.tx0MaxOutputs} id="tx0MaxOutputs"/>
                    <label className='col-form-label col-sm-11'>Max premixs per TX0 (0 = no limit)</label>
                  </div>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="autoAggregatePostmix" className="col-sm-2 col-form-label">Auto-Aggregate</label>
                <div className="col-sm-10">
                  {autoAggregatePostmixPossible && <div className="custom-control custom-switch">
                    <input type="checkbox" className="custom-control-input" onChange={e => myThis.onChangeCliConfig(cliConfig => cliConfig.mix.autoAggregatePostmix = checked(e))} defaultChecked={cliConfig.mix.autoAggregatePostmix} id="autoAggregatePostmix"/>
                    <label className="custom-control-label" htmlFor="autoAggregatePostmix">Aggregate deposit, premix & postmix when there is no more to mix (testnet only).{cliConfig.mix.autoTx0}</label></div>}
                  {!autoAggregatePostmixPossible && <div><i>Only available with <strong>AutoTX0</strong> on <strong>TestNet</strong></i></div>}
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="scode" className="col-sm-2 col-form-label">SCODE</label>
                <div className="col-sm-10">
                  <div className='row'>
                    <input type="text" className='form-control col-sm-2' onChange={e => {
                      const myValue = e.target.value
                      myThis.onChangeCliConfig(cliConfig => cliConfig.scode = myValue)
                    }} defaultValue={cliConfig.scode} id="scode"/>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>}
          <br/>

          <div className="form-group row">
            <div className="col-sm-5">
              <button type='button' className='btn btn-danger' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
        <br/><br/><br/><br/><br/>
      </div>
    );
  }
}
