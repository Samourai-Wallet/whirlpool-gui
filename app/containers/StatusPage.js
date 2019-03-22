// @flow
import React, { Component } from 'react';
import { Tail } from 'tail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import cliService from '../services/cliService';
import { CLI_CHECKSUM, CLI_FILENAME, CLI_LOG_FILE, CLI_URL, GUI_LOG_FILE } from '../const';
import { API_VERSION } from '../services/backendService';

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)
    this.state = {
      guiLog: ''
    }

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

  render() {
    if (this.divGuiLog && this.divGuiLog.current) {
      this.divGuiLog.current.scrollIntoView(false);
    }
    return (
      <div>
        <h1>Status</h1>

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
            <strong>Expected CLI</strong>
            <div>
              <small><a href={CLI_URL} target='_blank'>{CLI_FILENAME}</a><br/>
              Checksum: {CLI_CHECKSUM}, API {API_VERSION}</small>
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
      </div>
    );
  }
}
