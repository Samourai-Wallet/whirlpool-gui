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
import poolsService from '../../services/poolsService';

/* eslint-disable react/prefer-stateless-function */
class MixStatus extends React.PureComponent {
  render () {
    return (
      <div>
        <div className='row no-gutters'>
          <div className='col-sm-1 mixStatus align-self-center'>
            <div><strong>{mixService.getNbMixing()}</strong> mixing<br/> <strong>{mixService.getNbQueued()}</strong> queued</div>
          </div>
          <div className='col-sm-10 mixThreads'>
            <div className='row no-gutters justify-content-center'>
            {mixService.getThreads().map((utxo,i) => {

              const pool = poolsService.findPool(utxo.poolId)
              const poolInfo = pool ? <small> • {pool.nbConfirmed}/{pool.mixAnonymitySet} peers</small> : undefined

              let progressLabel = <div><small>{utils.toBtc(utxo.value)}</small> <strong>{utils.statusLabel(utxo)}</strong>{poolInfo?poolInfo:''}<br/>
                  {utxo.message && <small>{utxo.message}</small>}
              </div>
              const progressPercent = utxo.progressPercent ? utxo.progressPercent : 0
              const progressVariant = utxo.progressPercent ? undefined : 'info'
              const poolProgress = pool ? (100-progressPercent)*poolsService.computePoolProgress(pool)/100: undefined

              return <div className='col-sm-3 align-self-center' key={i}>
                <div className='row no-gutters'>
                  <div className='col-sm-12 item'>
                    <div className='label' title={utxo.hash+':'+utxo.index+' ('+utxo.account+') ('+mixService.computeLastActivity(utxo)+')'}>{progressLabel}</div>
                    <ProgressBar>
                      <ProgressBar animated now={progressPercent} variant={progressVariant} key={1} className={'progressBarSamourai'} />
                      {poolProgress && <ProgressBar variant="warning" now={poolProgress} key={2} />}
                    </ProgressBar>;
                  </div>
                </div>
              </div>
            })}
            </div>
          </div>
          <div className='col-sm-1 mixStatus align-self-center text-center'>
            {mixService.isStarted() && <button className='btn btn-sm btn-primary' onClick={() => mixService.stopMix()}><Icon.Square size={12}/> Stop</button>}
            {!mixService.isStarted() && <button className='btn btn-sm btn-primary' onClick={() => mixService.startMix()}><Icon.Play size={12}/> Start</button>}
          </div>
        </div>
      </div>
    )
  }
}

export default MixStatus
