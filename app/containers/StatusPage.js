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
  cliApiService, GUI_CONFIG_FILENAME,
  GUI_LOG_FILE,
  GUI_VERSION
} from '../const';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import LinkExternal from '../components/Utils/LinkExternal';
import { Card } from 'react-bootstrap';
import utils from '../services/utils';
import guiConfig from '../mainProcess/guiConfig';

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
                  <div className='col-sm-12'>
                    <strong>GUI</strong>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div style={{'float':'right'}}>
                  <button type='button' className='btn btn-danger' onClick={this.onResetConfig}><FontAwesomeIcon icon={Icons.faExclamationTriangle} /> Reset {cliService.getResetLabel()}</button>
                </div>
                <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Version:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div>GUI <strong>{GUI_VERSION}</strong>, API <strong>{cliApiService.getVersionName()}</strong></div>
                  </div>
                </div>
                {cliService.isConfigured() && <div className='row'>
                  <div className='col-sm-2'>
                    <strong>Mode:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div><strong>{cliService.isCliLocal()?'Standalone':'Remote CLI'}</strong></div>
                  </div>
                </div>}
                {cliService.isConfigured() && !cliService.isCliLocal() && <div className='row'>
                  <div className='col-sm-2'>
                    <strong>GUI proxy:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div><strong>{guiConfig.getGuiProxy()||'None'}</strong></div>
                  </div>
                </div>}
                <div className='row small'>
                  <div className='col-sm-12'>
                    <hr/>
                  </div>
                </div>
                <div className='row small'>
                  <div className='col-sm-2'>
                    <strong>Path:</strong><br/>
                    <strong>Config:</strong><br/>
                    <strong>Logs:</strong>
                  </div>
                  <div className='col-sm-10'>
                    <div><LinkExternal href={'file://'+APP_USERDATA}>{APP_USERDATA}</LinkExternal></div>
                    <div></div><LinkExternal href={'file://'+APP_USERDATA+'/'+GUI_CONFIG_FILENAME}>{APP_USERDATA+'/'+GUI_CONFIG_FILENAME}</LinkExternal><br/>
                    <div><LinkExternal href={'file://'+this.guiLogFile}>{this.guiLogFile}</LinkExternal></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <br/>
          </div>
        </div>

        <Card>
          <Card.Header>
            <div className='row'>
              <div className='col-sm-6'>
                <strong>CLI</strong>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className='row'>
              <div className='col-sm-2'>
                <strong>Status:</strong>
              </div>
              <div className='col-sm-10'>
                {cliStatusIcon}
              </div>
            </div>
            {cliService.isConfigured() && !cliService.isCliLocal() && <div>
              <div className='row'>
                <div className='col-sm-2'>
                  <strong>Remote CLI:</strong>
                </div>
                <div className='col-sm-10'>
                  {cliService.getCliUrl()}
                </div>
              </div>
            </div>}
            {cliService.isCliLocal() && <div>
              <div className='row'>
                <div className='col-sm-2'>
                  <strong>Local CLI:</strong>
                </div>
                <div className='col-sm-10'>
                  {cliLocalService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
                </div>
              </div>
              <div className='row'>
                <div className='col-sm-2'>
                  {cliLocalService.hasCliApi() && <strong>JAR:<br/></strong>}
                  {cliLocalService.hasCliApi() && <strong>Version:<br/></strong>}
                </div>
                <div className='col-sm-10'>
                  {cliLocalService.hasCliApi() && <div>{cliLocalService.getCliFilename()} ({cliLocalService.getCliChecksum()})</div>}
                  {cliLocalService.hasCliApi() && <div>{cliLocalService.getCliVersionStr()}</div>}
                  {!cliLocalService.hasCliApi() && <div><strong>CLI_API {cliApiService.getVersionName()} could not be resolved</strong><br/></div>}
                </div>
              </div>
            </div>}

            {cliService.isConfigured() && cliService.isConnected() && <div>
              <hr/>
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
            </div>}

            {cliService.isCliLocal() && <div>
              <hr/>
              <div className='row small'>
                <div className='col-sm-2'>
                  <strong>Path:</strong><br/>
                  <strong>Config:</strong><br/>
                  <strong>Logs:</strong><br/>
                  <strong>Errors:</strong>
                </div>
                <div className='col-sm-10'>
                  <LinkExternal href={'file://'+cliApiService.getCliPath()}>{cliApiService.getCliPath()}</LinkExternal><br/>
                  <LinkExternal href={'file://'+cliApiService.getCliPath()+CLI_CONFIG_FILENAME}>{cliApiService.getCliPath()+CLI_CONFIG_FILENAME}</LinkExternal><br/>
                  <LinkExternal href={'file://'+this.cliLogFile}>{this.cliLogFile}</LinkExternal><br/>
                  <LinkExternal href={'file://'+this.cliLogErrorFile}>{this.cliLogErrorFile}</LinkExternal>
                </div>
              </div>
            </div>}

          </Card.Body>
        </Card>
        <br/>

        <br/><br/>
      </div>
    );
  }
}
