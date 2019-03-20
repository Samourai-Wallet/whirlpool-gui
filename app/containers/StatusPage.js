// @flow
import React, { Component } from 'react';
import { Tail } from 'tail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import { remote } from 'electron';
import cliService from '../services/cliService';
import { getCliLogFile, getGuiLogFile, LOG_FILE } from '../const';

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
    this.cliLogFile = getCliLogFile(remote.app)
    this.guiLogFile = getGuiLogFile(remote.app)


    const truncate = (log,limit) => log.substring(Math.max(0, log.length-limit))
    if (cliService.isCliLocal()) {
      // cliLog
      const onCliLine = (data) => {
        const log = this.state.cliLog + data
        this.setState({
          cliLog: truncate(log, 5000)
        })
      }
      const cliTail = new Tail(this.cliLogFile, { fromBeginning: true });
      cliTail.on("line", onCliLine.bind(this))
    }

    // guiLog
    const onGuiLine = (data) => {
      const log = this.state.guiLog + data
      console.log('onGuiLine',log)
      this.setState({
        guiLog: truncate(log, 5000)
      })
    }
    const guiTail = new Tail(this.guiLogFile, { fromBeginning: true });
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
          <div className='col-sm-5'>
            <strong>CLI status</strong><br/>
            {cliService.getStatusIcon((icon,text)=><p>{icon} {text}</p>)}
          </div>
          <div className='col-sm-5'>
            {cliService.isCliLocal() && <div>
              <strong>Running CLI locally</strong>
              <div>{cliLocalService.getStatusIcon((icon,text)=><p>{icon} {text}</p>)}</div>
            </div>}

            {!cliService.isCliLocal() && <div>
              <strong>Remote DOJO / CLI</strong><br/>{cliService.getCliUrl()}
            </div>}
            <br/>
          </div>
        </div>

        <div className='row'>
          <div className='col-sm-10'>
            <strong>GUI logs: <a href={this.guiLogFile} target='_blank'>{this.guiLogFile}</a></strong>
            <pre className='logs' ref={this.divGuiLog}>{this.state.guiLog}</pre>
          </div>
        </div>

        {cliService.isCliLocal() && <div className='row'>
          <div className='col-sm-10'>
            <strong>CLI logs: <a href={this.cliLogFile} target='_blank'>{this.cliLogFile}</a></strong>
            <pre className='logs' ref={this.divCliLog}>{this.state.cliLog}</pre>
          </div>
        </div>}
      </div>
    );
  }
}
