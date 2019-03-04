/**
 *
 * Status
 *
 */

import React from 'react';
import {ProgressBar} from 'react-bootstrap';
import mixService from '../../services/mixService';
import utils from '../../services/utils';
import * as Icon from 'react-feather';

/* eslint-disable react/prefer-stateless-function */
class MixStatus extends React.PureComponent {
  render () {
    return (
      <div>
        <div className='row'>
          <div className='col-sm-2 mixStatus'>
            <div>{mixService.getNbMixing()} mixing, {mixService.getNbQueued()} queued</div>
            {mixService.isStarted() && <button className='btn btn-sm btn-primary' onClick={() => mixService.stopMix()}><Icon.Square size={12}/> Stop mixing</button>}
            {!mixService.isStarted() && <button className='btn btn-sm btn-primary' onClick={() => mixService.startMix()}><Icon.Play size={12}/> Start mixing</button>}
          </div>
          <div className='col-sm-10 mixThreads'>
            <div className='row'>
            {mixService.getThreads().map((utxo,i) => {
              const progressLabel = utxo.progressLabel ? utxo.progressLabel : ''
              return <div className='col-sm-6' key={i}>
                <div className='row no-gutters'>
                  <div className='col-sm-2'>#{(i+1)}: <small>{utxo.poolId}</small></div>
                  <div className='col-sm-2'>{utils.statusLabel(utxo.status)}</div>
                  <div className='col-sm-5'>
                    {utxo.progressPercent && <div className='col-sm-11'><ProgressBar animated now={utxo.progressPercent} label={progressLabel} /></div>}
                    {!utxo.progressPercent && <small>{progressLabel}</small>}
                  </div>
                  <div className='col-sm-3'><small>{mixService.computeLastActivity(utxo)}</small></div>
                </div>
              </div>
            })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MixStatus
