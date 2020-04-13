// @flow
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import cliService from '../services/cliService';
import {
  APP_USERDATA,
  CLI_CONFIG_FILENAME,
  CLI_LOG_ERROR_FILE,
  CLI_LOG_FILE,
  cliApiService,
  GUI_LOG_FILE,
  GUI_VERSION
} from '../const';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import LinkExternal from '../components/Utils/LinkExternal';
import { Card } from 'react-bootstrap';
import utils from '../services/utils';

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)

    this.onResetConfig = this.onResetConfig.bind(this)

    this.cliLogFile = CLI_LOG_FILE
    this.cliLogErrorFile = CLI_LOG_ERROR_FILE
    this.guiLogFile = GUI_LOG_FILE
  }

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }


  render() {
    const cliStatusIcon = cliService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)

    return (
      <div>
        <h1>System</h1>

        <div className='row'>
          <div className='col-sm-12'>
            <Card>
              <Card.Header>
                <div className='row'>
                  <div className='col-sm-6'>
                    <strong>GUI</strong>
                  </div>
                  <div className='col-sm-6'>
                    {cliService.getLoginStatusIcon((icon,text)=><div>{icon} {text}</div>)}
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Version:</strong><br/>
                    <strong>Path:</strong><br/>
                    <strong>GUI logs:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div>GUI <strong>{GUI_VERSION}</strong>, API <strong>{cliApiService.getVersionName()}</strong></div>
                    <div><LinkExternal href={'file://'+APP_USERDATA}>{APP_USERDATA}</LinkExternal></div>
                    <div><LinkExternal href={'file://'+this.guiLogFile}>{this.guiLogFile}</LinkExternal></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <br/>
          </div>
        </div>

        {!cliService.isCliLocal() && <Card>
          <Card.Header>
            <div className='row'>
              <div className='col-sm-6'>
                <strong>CLI: remote</strong>
              </div>
              <div className='col-sm-6'>
                {cliStatusIcon}
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className='row'>
              <div className='col-sm-12'>
                {cliStatusIcon}<br/>
                {cliService.isConfigured() && <span>Remote CLI: {cliService.getCliUrl()}</span>}
              </div>
            </div>
          </Card.Body>
        </Card>}

        {cliService.isCliLocal() && <Card>
          <Card.Header>
            <div className='row'>
              <div className='col-sm-6'>
                <strong>CLI: standalone</strong>
              </div>
              <div className='col-sm-6'>
                {cliStatusIcon}
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className='row'>
              <div className='col-sm-2'>
                <strong>Status:</strong>
              </div>
              <div className='col-sm-10'>
                {cliLocalService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-2'>
                <strong>Path:</strong><br/>
                <strong>Config:</strong><br/>
                {cliLocalService.hasCliApi() && <strong>JAR:<br/></strong>}
                {cliLocalService.hasCliApi() && <strong>Version:<br/></strong>}<br/>
              </div>
              <div className='col-sm-10'>
                <LinkExternal href={'file://'+cliApiService.getCliPath()}>{cliApiService.getCliPath()}</LinkExternal><br/>
                <LinkExternal href={'file://'+cliApiService.getCliPath()+CLI_CONFIG_FILENAME}>{CLI_CONFIG_FILENAME}</LinkExternal><br/>
                {cliLocalService.hasCliApi() && <div>{cliLocalService.getCliFilename()} ({cliLocalService.getCliChecksum()})</div>}
                {cliLocalService.hasCliApi() && <div>{cliLocalService.getCliVersionStr()}</div>}
                {!cliLocalService.hasCliApi() && <div><strong>CLI_API {cliApiService.getVersionName()} could not be resolved</strong><br/></div>}
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-2'>
                <strong>CLI logs:</strong><br/>
                <strong>CLI errors:</strong>
              </div>
              <div className='col-sm-10'>
                <LinkExternal href={'file://'+this.cliLogFile}>{this.cliLogFile}</LinkExternal><br/>
                <LinkExternal href={'file://'+this.cliLogErrorFile}>{this.cliLogErrorFile}</LinkExternal>
              </div>
            </div>
          </Card.Body>
        </Card>}
        <br/>

        {cliService.isConnected() && <div className='row'>
          <div className='col-sm-12'>
            <Card>
              <Card.Header>
                <div className='row'>
                  <div className='col-sm-6'>
                    <strong>Connectivity</strong>
                  </div>
                  <div className='col-sm-6'>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Whirlpool server:</strong><br/>
                    <strong>DOJO:</strong><br/>
                    <strong>Tor:</strong><br/>
                  </div>
                  <div className='col-sm-10'>
                    <div>{cliService.getServerName()}</div>
                    <div>
                      {utils.checkedIcon(cliService.isDojo())} <strong>{cliService.isDojo()?'enabled':'disabled'}</strong>&nbsp;
                      {cliService.isDojo() && <small>{cliService.getDojoUrl()}</small>}
                    </div>
                    <div>{utils.checkedIcon(cliService.isTor())} <strong>{cliService.isTor()?'enabled':'disabled'}</strong></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <br/>
          </div>
        </div>}

        <div className="col-sm-12">
          <button type='button' className='btn btn-danger' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
        </div>
        <br/><br/>
      </div>
    );
  }
}
