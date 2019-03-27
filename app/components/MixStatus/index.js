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
              let progressLabel = <div><small>{utils.toBtc(utxo.value)}</small> <strong>{utils.statusLabel(utxo)}</strong><br/>
                  {utxo.message && <small>{utxo.message}</small>}
              </div>
              const progressPercent = utxo.progressPercent ? utxo.progressPercent : 0
              const progressVariant = utxo.progressPercent ? undefined : 'info'
              return <div className='col-sm-3' key={i}>
                <div className='row no-gutters'>
                  <div className='col-sm-12 item'>
                    <div className='label' title={utxo.hash+':'+utxo.index+' ('+utxo.account+')\n'+'since '+mixService.computeLastActivity(utxo)}>{progressLabel}</div>
                    <ProgressBar animated now={progressPercent} variant={progressVariant} />
                  </div>
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
