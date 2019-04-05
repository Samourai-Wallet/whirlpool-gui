// @flow
import React, { Component } from 'react';
import { Tail } from 'tail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import cliService from '../services/cliService';
import {
  API_VERSION,
  CLI_CHECKSUM,
  CLI_FILENAME,
  CLI_LOG_FILE,
  CLI_URL,
  CLI_VERSION,
  GUI_LOG_FILE,
  GUI_VERSION
} from '../const';
import * as Icons from "@fortawesome/free-solid-svg-icons";

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)
    this.state = {
      guiLog: ''
    }

    this.onResetConfig = this.onResetConfig.bind(this)

    this.divGuiLog = React.createRef()
    this.cliLogFile = CLI_LOG_FILE
    this.guiLogFile = GUI_LOG_FILE

    // guiLog
    const truncate = (log,limit) => log.substring(Math.max(0, log.length-limit))
    const onGuiLine = (data) => {
      const log = this.state.guiLog + data
      this.setState({
        guiLog: truncate(log, 5000)+'\n'
      })
    }
    const guiTail = new Tail(this.guiLogFile, { fromBeginning: true, fsWatchOptions: {interval: 5007} });
    guiTail.on("line", onGuiLine.bind(this))
  }

  onResetConfig() {
    if (confirm('This will reset '+cliService.getResetLabel()+'. Are you sure?')) {
      cliService.resetConfig()
    }
  }

  render() {
    if (this.divGuiLog && this.divGuiLog.current) {
      this.divGuiLog.current.scrollIntoView(false);
    }
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
            GUI <strong>{GUI_VERSION}</strong>, CLI <strong>{CLI_VERSION}</strong>
            <div>
              <small><a href={CLI_URL} target='_blank'>{CLI_FILENAME}</a> - API {API_VERSION}<br/>
              {CLI_CHECKSUM}</small>
            </div>
          </div>
        </div>

        <br/>
        <div className='row'>
          <div className='col-sm-12'>
            <strong>GUI logs: <a href={this.guiLogFile} target='_blank'>{this.guiLogFile}</a></strong>
            <pre className='logs' ref={this.divGuiLog}>{this.state.guiLog}</pre>
          </div>
        </div>

        {cliService.isCliLocal() && <div className='row'>
          <div className='col-sm-12'>
            <strong>CLI logs: <a href={this.cliLogFile} target='_blank'>{this.cliLogFile}</a></strong>
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
