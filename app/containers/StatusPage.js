// @flow
import React, { Component } from 'react';
import { Tail } from 'tail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import cliService from '../services/cliService';
import { CLI_LOG_FILE, GUI_LOG_FILE } from '../const';

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)
    this.state = {
      cliLog: '',
      guiLog: ''
    }

    this.divCliLog = React.createRef()
    this.divGuiLog = React.createRef()
    this.cliLogFile = CLI_LOG_FILE
    this.guiLogFile = GUI_LOG_FILE


    const truncate = (log,limit) => log.substring(Math.max(0, log.length-limit))
    if (cliService.isCliLocal()) {
      // cliLog
      const onCliLine = (data) => {
        const log = this.state.cliLog + data
        this.setState({
          cliLog: truncate(log, 5000)+'\n'
        })
      }
      const cliTail = new Tail(this.cliLogFile, { fromBeginning: true, fsWatchOptions: {interval: 10077}});
      cliTail.on("line", onCliLine.bind(this))
    }

    // guiLog
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
    if (this.divCliLog && this.divCliLog.current) {
      this.divCliLog.current.scrollIntoView(false);
    }
    if (this.divGuiLog && this.divGuiLog.current) {
      this.divGuiLog.current.scrollIntoView(false);
    }
    return (
      <div>
        <h1>Status</h1>

        <div className='row'>
          <div className='col-sm-6'>
            <strong>GUI status</strong>
            {cliService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
            {cliService.getLoginStatusIcon((icon,text)=><div>{icon} {text}</div>)}
          </div>
          <div className='col-sm-6'>
            {cliService.isCliLocal() && <div>
              <strong>Running CLI locally</strong>
              {cliLocalService.getStatusIcon((icon,text)=><div>{icon} {text}</div>)}
            </div>}

            {!cliService.isCliLocal() && <div>
              <strong>Remote DOJO / CLI</strong><br/>{cliService.getCliUrl()}
            </div>}
            <br/>
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
            <pre className='logs' ref={this.divCliLog}>{this.state.cliLog}</pre>
          </div>
        </div>}
      </div>
    );
  }
}
