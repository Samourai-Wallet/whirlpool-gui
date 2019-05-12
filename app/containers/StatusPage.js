// @flow
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import cliService from '../services/cliService';
import {
  API_VERSION, CLI_LOG_ERRORS_FILE,
  CLI_LOG_FILE,
  GUI_LOG_FILE,
  GUI_VERSION
} from '../const';
import * as Icons from "@fortawesome/free-solid-svg-icons";
import LinkExternal from '../components/Utils/LinkExternal';

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)

    this.onResetConfig = this.onResetConfig.bind(this)

    this.cliLogFile = CLI_LOG_FILE
    this.cliLogErrorFile = CLI_LOG_ERRORS_FILE
    this.guiLogFile = GUI_LOG_FILE
  }

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  render() {
    return (
      <div>
        <h1>System</h1>

        <div className='row'>
          <div className='col-sm-4'>
            <strong>GUI status</strong>
            {cliService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
            {cliService.getLoginStatusIcon((icon,text)=><div>{icon} {text}</div>)}
          </div>
          <div className='col-sm-4'>
            {cliService.isCliLocal() && <div>
              <strong>Standalone (run CLI from GUI)</strong>
              {cliLocalService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
            </div>}
            {!cliService.isCliLocal() && <div>
              <strong>Remote DOJO / CLI</strong><br/>
              {cliService.isConfigured() && <span>CLI: {cliService.getCliUrl()}</span>}
            </div>}
            {cliService.isConnected() && <div>
              Server: {cliService.getServerUrl()}
            </div>}

          </div>
          <div className='col-sm-4'>
            GUI <strong>{GUI_VERSION}</strong>, CLI API <strong>{API_VERSION}</strong>
            {cliService.isCliLocal() && <div>
              {cliLocalService.hasCliApi() &&
              <small>CLI {cliLocalService.getCliVersionStr()} - <a href={cliLocalService.getCliUrl()} target='_blank'>{cliLocalService.getCliFilename()}</a><br/>
                {cliLocalService.getCliChecksum()}</small>
              }
              {!cliLocalService.hasCliApi() &&
              <small><strong>CLI_API {API_VERSION} could not be resolved</strong></small>
              }
            </div>}
          </div>
        </div>

        <br/>
        <div className='row'>
          <div className='col-sm-2'>
            <strong>GUI logs:</strong>
          </div>
          <div className='col-sm-10'>
            <LinkExternal href={this.guiLogFile}>{this.guiLogFile}</LinkExternal>
          </div>
        </div>

        {cliService.isCliLocal() && <div className='row'>
          <div className='col-sm-2'>
            <strong>CLI logs:</strong><br/>
            <strong>CLI errors:</strong>
          </div>
          <div className='col-sm-10'>
            <LinkExternal href={this.cliLogFile}>{this.cliLogFile}</LinkExternal><br/>
            <LinkExternal href={this.cliLogErrorFile}>{this.cliLogErrorFile}</LinkExternal>
          </div>
        </div>}
        <br/>
        <div className="col-sm-12">
          <button type='button' className='btn btn-danger' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
        </div>
      </div>
    );
  }
}
