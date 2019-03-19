// @flow
import React, { Component } from 'react';
import { Tail } from 'tail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';
import { remote } from 'electron';
import cliService from '../services/cliService';
import { getLogFile, LOG_FILE } from '../const';

type Props = {};

export default class StatusPage extends Component<Props> {

  constructor(props) {
    super(props)
    this.state = {
      logs: ''
    }

    this.divLogs = React.createRef()
    this.logFile = getLogFile(remote.app)

    const onLine = (data) => {
      this.setState({
        logs: data+this.state.logs
      })
    }
    const tail = new Tail(this.logFile, {fromBeginning: true});
    tail.on("line", onLine.bind(this))

    tail.on("error", function(error) {
      console.error('tail error',error)
    });
  }

  render() {
    if (this.divLogs && this.divLogs.current) {
      this.divLogs.current.scrollIntoView({ behavior: "smooth" });
    }
    return (
      <div>
        <h1>Status</h1>

        <div>
          <strong>CLI status</strong><br/>
          {cliService.getStatusIcon((icon,text)=><p>{icon} {text}</p>)}
        </div>

        {cliService.isCliLocal() && <div>
          <strong>Running CLI locally</strong>
          <div>{cliLocalService.getStatusIcon((icon,text)=><p>{icon} {text}</p>)}</div>
          <strong>{this.logFile}</strong>
          <div className='logs' ref={this.divLogs}>{this.state.logs}</div>
        </div>}

        {!cliService.isCliLocal() && <div>
          <strong>Remote DOJO / CLI</strong><br/>{cliService.getCliUrl()}
        </div>}
        <br/>
      </div>
    );
  }
}
