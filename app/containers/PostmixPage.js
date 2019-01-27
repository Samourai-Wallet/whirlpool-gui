// @flow
import React, { Component } from 'react';
import './PostmixPage.css';
import * as Icon from 'react-feather';
import walletService from '../services/walletService';
import utils from '../services/utils';

type Props = {};

export default class PostmixPage extends Component<Props> {
  props: Props;

  render() {
    const utxosPostmix = walletService.getUtxosPostmix()
    return (
      <div className='postmixPage'>
        <div className='row'>
          <div className='col-sm-2'>
            <h2>Mixed</h2>
          </div>
          <div className='col-sm-8 stats'>
            <span className='text-primary'>{utxosPostmix.length} utxos mixed ({utils.toBtc(walletService.getBalancePostmix())}btc)</span>
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
          </tr>
          </thead>
          <tbody>
          {utxosPostmix.map((utxo,i) => {
            return <tr key={i}>
              <td>
                <small><a href={utils.linkExplorer(utxo)} target='_blank'>{utxo.hash}:{utxo.index}</a><br/>
                {utxo.path} · {utxo.confirmations} confirms</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>-</td>
              <td><span className='text-primary'></span></td>
              <td></td>,
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
