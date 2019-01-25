// @flow
import React, { Component } from 'react';
import './StatusPage.css';
import * as Icon from 'react-feather';
import walletService from '../services/walletService';

type Props = {};

export default class StatusPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className='statusPage'>
        <div class='row'>
          <div class='col-sm-2'>
            <h2>Premix</h2>
          </div>
          <div class='col-sm-4 stats'>
            <span class='text-primary'>4 utxo mixing (1.58btc) · 0.16btc volume</span>
          </div>
          <div className='col-sm-4 stats'>
            <button className='btn btn-sm btn-primary'><Icon.Square size={12}/> Stop all</button> <button className='btn btn-sm btn-primary'><Icon.Play size={12}/> Resume all</button>
          </div>
        </div>
        <div class="tablescroll">
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
            <th scope="col">Last activity</th>
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody>
          {walletService.getUtxosPremix().map((utxo,i) => {
            return <tr key={i}>
              <th scope="row">{(i+1)}</th>
              <td>
                <small>{utxo.hash}:{utxo.index}</small>
              </td>
              <td>{utxo.value}</td>
              <td>-</td>
              <td><span className='text-primary'></span></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
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

        <br/>
        <br/>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Postmix</h2>
          </div>
          <div className='col-sm-8 stats'>
            <span className='text-primary'>4 utxo mixed (0.17btc) · 0.87btc volume</span>
          </div>
        </div>
        <div className="tablescroll">
        <table className="table table-sm table-hover">
          <thead>
          <tr>
            <th scope="col">UTXO</th>
            <th scope="col">Amount</th>
            <th scope="col">Pool</th>
            <th scope="col" colSpan={2}>Status</th>
            <th scope="col">Mixs</th>
            <th scope="col">Last activity</th>
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody>
          {walletService.getUtxosPostmix().map((utxo,i) => {
            return <tr key={i}>
              <td>
                <small>{utxo.hash}:{utxo.index}</small>
              </td>
              <td>{utxo.value}</td>
              <td>-</td>
              <td><span className='text-primary'></span></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          })}
          {false && <todo>
          <tr>
            <td><small>9353e3c299b84f74...02e0c:3</small></td>
            <td>0.1</td>
            <td>0.1btc</td>
            <td><span className='text-success'>SUCCESS</span></td>
            <td></td>
            <td>7/7</td>
            <td>7m ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Mix again'><Icon.Play size={12} /></button>
            </td>
          </tr>
          <tr>
            <td><small>198787d1085b1d94...c8476:2</small></td>
            <td>0.01</td>
            <td>0.01btc</td>
            <td><span className='text-success'>SUCCESS</span></td>
            <td></td>
            <td>5/5</td>
            <td>1h 15m ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Mix again'><Icon.Play size={12} /></button>
            </td>
          </tr>
          <tr>
            <td><small>198787d1085b1d94...8476:3</small></td>
            <td>0.05</td>
            <td>0.05btc</td>
            <td><span className='text-success'>SUCCESS</span></td>
            <td></td>
            <td>3/3</td>
            <td>1d ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Mix again'><Icon.Play size={12} /></button>
            </td>
          </tr>
          <tr>
            <td><small>9aebbcd00317c06e...1e4d2:6</small></td>
            <td>0.01</td>
            <td>0.01btc</td>
            <td><span className='text-success'>SUCCESS</span></td>
            <td></td>
            <td>1/1</td>
            <td>3d ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Mix again'><Icon.Play size={12} /></button>
            </td>
          </tr>
          <tr>
            <td><small>198787d1085b1d94...c8476:1</small></td>
            <td>1.5149027</td>
            <td>0.1btc</td>
            <td><span className='text-danger'>ERROR</span></td>
            <td>TX0: broadcast failed</td>
            <td>0/3</td>
            <td>5d ago</td>
            <td>
              <button className='btn btn-sm btn-primary' title='Retry'><Icon.RefreshCw size={12} /></button>
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
