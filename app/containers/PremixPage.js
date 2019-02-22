// @flow
import React, { Component } from 'react';
import './PremixPage.css';
import * as Icon from 'react-feather';
import walletService from '../services/walletService';
import utils from '../services/utils';
import mixService from '../services/mixService';
import modalService from '../services/modalService';

type Props = {};

export default class PremixPage extends Component<Props> {
  props: Props;

  render() {
    const utxosPremix = walletService.getUtxosPremix()
    return (
      <div className='premixPage'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Mixing</h2>
          </div>
          <div className='col-sm-10 stats'>
            <span className='text-primary'>{utxosPremix.length} utxos mixing ({utils.toBtc(walletService.getBalancePremix())}btc)</span>
          </div>
        </div>
        <div className='tablescroll'>
        <table className="table table-sm table-hover">
          <thead>
          <tr>
            <th scope="col">Priority</th>
            <th scope="col">UTXO</th>
            <th scope="col">Amount</th>
            <th scope="col">Pool</th>
            <th scope="col">Status</th>
            <th scope="col"></th>
            <th scope="col">Mixs</th>
            <th scope="col" colSpan={2}>Last activity</th>
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody>
          {utxosPremix.map((utxo,i) => {
            return <tr key={i}>
              <th scope="row">{utxo.priority}</th>
              <td>
                <small><a href={utils.linkExplorer(utxo)} target='_blank'>{utxo.hash}:{utxo.index}</a><br/>
                  {utxo.account} · {utxo.path} · {utxo.confirmations} confirms</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>{utxo.poolId}</td>
              <td><span className='text-primary'>{utils.statusLabel(utxo.status)}</span></td>
              <td></td>
              <td>{utxo.mixsDone}/{utxo.mixsTarget}</td>
              <td>{utxo.message}</td>
              <td><small>{mixService.computeLastActivity(utxo)}</small></td>
              <td>
                {mixService.isTx0Possible(utxo) && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => modalService.openTx0(utxo)} >Tx0 <Icon.ChevronsRight size={12}/></button>}
                {mixService.isStartMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => mixService.startMix(utxo)}>Start <Icon.Play size={12} /></button>}
                {mixService.isStopMixPossible(utxo) && <button className='btn btn-sm btn-primary' title='Stop mixing' onClick={() => mixService.stopMix(utxo)}>Stop <Icon.Square size={12} /></button>}
              </td>
            </tr>
          })}
          {false && <todo>
          <tr>
            <th scope="row">1</th>
            <td><small>9353e3c299b84fc3...02e0c:3</small></td>
            <td>0.01</td>
            <td>0.01btc</td>
            <td><span className='text-primary'>MIX</span></td>
            <td>
              <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: '30%'}}>
                  (3/10) REGISTERED_INPUT
                </div>
              </div>
            </td>
            <td>1/3</td>
            <td>5s ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Stop'><Icon.Square size={12} /></button>
            </td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td><small>198787d1085b1d94...c8476:2</small></td>
            <td>0.05</td>
            <td>0.05btc</td>
            <td><span className='text-primary'>MIX</span></td>
            <td>
              <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: '30%'}}>
                  (3/10) REGISTERED_INPUT
                </div>
              </div>
            </td>
            <td>3/5</td>
            <td>28s ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Stop'><Icon.Square size={12} /></button>
            </td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td><small>198787d1085b1d94...c8476:3</small></td>
            <td>0.01000102</td>
            <td>0.01btc</td>
            <td><span className='text-primary'>MIX</span></td>
            <td>
              <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: '60%'}}>
                  (6/10) REGISTERING_OUTPUT
                </div>
              </div>
            </td>
            <td>0/∞</td>
            <td>2m ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Stop'><Icon.Square size={12} /></button>
            </td>
          </tr>
          <tr>
            <th scope="row">4</th>
            <td><small>9aebbcd00317c06e...1e4d2:6</small></td>
            <td>0.01000102</td>
            <td>0.01btc</td>
            <td><span className='text-danger'>STOPPED</span></td>
            <td>

            </td>
            <td>0/3</td>
            <td>1d ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Resume'><Icon.Play size={12} /></button>
            </td>
          </tr>
          <tr>
            <th scope="row">5</th>
            <td><small>198787d1085b1d94...c8476:1</small></td>
            <td>1.5149027</td>
            <td>0.1btc</td>
            <td>QUEUED</td>
            <td></td>
            <td>0/3</td>
            <td>5s ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Stop'><Icon.Square size={12} /></button>
            </td>
          </tr>
          </todo>}
          </tbody>
        </table>
        </div>
      </div>
    );
  }
}
