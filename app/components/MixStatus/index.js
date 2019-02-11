/**
 *
 * Status
 *
 */

import React from 'react';
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
            {mixService.isStarted() && <button className='btn btn-sm btn-primary' onClick={() => mixService.stop()}><Icon.Square size={12}/> Stop mixing</button>}
            {!mixService.isStarted() && <button className='btn btn-sm btn-primary' onClick={() => mixService.start()}><Icon.Play size={12}/> Start mixing</button>}
          </div>
          <div className='col-sm-10 mixThreads'>
            <div className='row'>
            {mixService.getThreads().map((utxo,i) => {
              let progressStr = ''
              if (utxo.progressPercent) progressStr += utxo.progressPercent + '%'
              if (utxo.progressLabel) progressStr += (progressStr?' · ':'')+utxo.progressLabel
              return <div className='col-sm-6' key={i}>
                  <div className='row no-gutters'>
                    <div className='col-sm-3'>#{(i+1)}: <span className='text-primary'>{utils.statusLabel(utxo.status)}</span> <small>{utxo.poolId}</small></div>
                    <div className='col-sm-4'><small>{progressStr ? ' (' + progressStr + ')' : ''}</small></div>
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
