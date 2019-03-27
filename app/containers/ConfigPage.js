// @flow
import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import cliService from '../services/cliService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { WHIRLPOOL_SERVER } from '../const';
import { logger } from '../utils/logger';
import { CliConfigService } from '../services/cliConfigService';
import walletService from '../services/walletService';

type Props = {};

export default class ConfigPage extends Component<Props> {

  constructor(props) {
    super(props)

    this.state = {
      info: undefined,
      error: undefined,
      cliConfig: undefined
    }

    this.cliConfigService = new CliConfigService(cliConfig => this.setState({
      cliConfig: cliConfig
    }))

    this.onResetConfig = this.onResetConfig.bind(this)
    this.onChangeServer = this.onChangeServer.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onResetConfig() {
    if (confirm('This will reset GUI configuration. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  onChangeServer(e) {
    const server = e.target.value
    const cliConfig = this.cliConfigService.setServer(this.state.cliConfig, server)

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

  render() {
    if (!this.state.cliConfig) {
      return <small>Fetching CLI configuration...</small>
    }
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
          <div className="form-group row">
            <label htmlFor="server" className="col-sm-2 col-form-label">Server</label>
            <div className="col-sm-8">
              <select className="form-control" id="server" onChange={this.onChangeServer} defaultValue={this.cliConfigService.getServer()}>
                {Object.keys(WHIRLPOOL_SERVER).map((value) => <option value={value} key={value}>{WHIRLPOOL_SERVER[value]}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">TOR</label>
            <div className="col-sm-8">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1" disabled/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Enable TOR (coming soon)</label>
              </div>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-5">
              <button type='button' className='btn btn-danger' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset GUI configuration</button>
            </div>
            <div className="col-sm-5">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
