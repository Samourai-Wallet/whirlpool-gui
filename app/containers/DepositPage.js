// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import './PremixPage.css';
import * as Icon from 'react-feather';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { walletActions } from '../actions/walletActions';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import utils, { TX0_MIN_CONFIRMATIONS } from '../services/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import mixService from '../services/mixService';
import backendService from '../services/backendService';

class DepositPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      show: false,
      showTx0: false,
      depositAddress: undefined
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleNextDepositAddress = this.handleNextDepositAddress.bind(this)

    this.handleShowTx0 = this.handleShowTx0.bind(this);
    this.handleCloseTx0 = this.handleCloseTx0.bind(this);
    this.handleChangePoolTx0 = this.handleChangePoolTx0.bind(this);
    this.handleChangeMixsTargetTx0 = this.handleChangeMixsTargetTx0.bind(this);
    this.handleSubmitTx0 = this.handleSubmitTx0.bind(this)
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.doFetchDepositAddressAndShow()
  }

  handleNextDepositAddress() {
    this.doFetchDepositAddressAndShow(true)
  }

  doFetchDepositAddressAndShow(distinct=false) {
    const setState = depositAddress => {
      this.setState({
        show: true,
        depositAddress: depositAddress
      })
    }
    if (distinct) {
      return walletService.fetchDepositAddressDistinct(this.state.depositAddress).then(setState)
    } else {
      return walletService.fetchDepositAddress().then(setState)
    }
  }

  // tx0

  handleCloseTx0() {
    this.setState({ showTx0: false });
  }

  handleShowTx0(utxo) {
    const setState = poolsResponse => {
      console.log('poolsResponse',poolsResponse)
      this.setState({
        showTx0: {
          utxo: utxo,
          poolsResponse: poolsResponse,
          poolId: poolsResponse.pools.length>0 ? poolsResponse.pools[0].poolId : undefined,
          mixsTarget: 0
        }
      })
    }
    return backendService.tx0.fetchPools(utxo.value).then(setState)
  }

  handleChangePoolTx0(e) {
    const poolId = e.target.value

    const showTx0New = Object.assign({}, this.state.showTx0)
    showTx0New.poolId = poolId
    this.setState({
      showTx0: showTx0New
    })
  }

  handleChangeMixsTargetTx0(e) {
    const mixsTarget = parseInt(e.target.value)

    const showTx0New = Object.assign({}, this.state.showTx0)
    showTx0New.mixsTarget = mixsTarget
    this.setState({
      mixsTarget: mixsTarget
    })
  }

  handleSubmitTx0() {
    backendService.tx0.create(this.state.showTx0.utxo.hash, this.state.showTx0.utxo.index, this.state.showTx0.poolId, this.state.showTx0.mixsTarget).then((tx0Response) => {
      console.log('tx0Response',tx0Response)
      walletService.fetchState()
    })
    this.handleCloseTx0();
  }

  render() {
    const utxosDeposit = walletService.getUtxosDeposit()
    return (
      <div className='depositPage'>
        <Modal show={this.state.show} onHide={this.handleClose} animation={false}>
            <Modal.Header>
            <Modal.Title>Start mixing</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Send funds to your deposit wallet:
            </p>
            <div className='depositAddress'>
              <QRCode value={this.state.depositAddress} /><br/>
              <b>{this.state.depositAddress}</b> <a onClick={this.handleNextDepositAddress} title='Change deposit address'><FontAwesomeIcon icon={Icons.faRedo} /></a>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>

        {this.state.showTx0 && <Modal show={this.state.showTx0} onHide={this.handleCloseTx0} animation={false} dialogClassName="modal-tx0">
          <Modal.Header>
            <Modal.Title>Add to premix<br/>
              <small>{this.state.showTx0.utxo.hash}:{this.state.showTx0.utxo.index}</small></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This will split your UTXO and start mixing.<br/>
              Value: <strong>{utils.toBtc(this.state.showTx0.utxo.value)}btc</strong><br/>
              <br/>
              Select a pool:
              <select className="form-control" onChange={this.handleChangePoolTx0} defaultValue={this.state.showTx0.poolId}>
                {this.state.showTx0.poolsResponse.pools.map(pool => <option key={pool.poolId} value={pool.poolId}>{pool.poolId} (denomination: {utils.toBtc(pool.denomination)}btc, anonymity set: {pool.mixAnonymitySet}, connected: {pool.nbRegistered}, last mix: {moment.duration(pool.elapsedTime).humanize()})</option>)}
              </select><br/>

              Mixs target: <select className="form-control col-sm-2" onChange={this.handleChangeMixsTargetTx0} defaultValue={this.state.showTx0.mixsTarget}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={0}>∞</option>
            </select> (you can change this later)
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseTx0}>Close</Button>
            <Button onClick={this.handleSubmitTx0}>Start mixing</Button>
          </Modal.Footer>
        </Modal>}

        <div className='row'>
          <div className='col-sm-2'>
            <h2>Deposit</h2>
          </div>
          <div className='col-sm-4 stats'>
            <span className='text-primary'>{utxosDeposit.length} utxos on deposit ({utils.toBtc(walletService.getBalanceDeposit())}btc)</span>
          </div>
          <div className='col-sm-4 stats'>
            <button className='btn btn-sm btn-primary' onClick={this.handleShow}><Icon.Plus size={12}/> Deposit</button>
          </div>
        </div>
        <div className="tablescroll">
        <table className="table table-sm table-hover">
          <thead>
          <tr>
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
          {utxosDeposit.map((utxo,i) => {
            return <tr key={i}>
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
                {utxo.confirmations < TX0_MIN_CONFIRMATIONS && <small>unconfirmed</small>}
                {utxo.confirmations >= TX0_MIN_CONFIRMATIONS && <button className='btn btn-sm btn-primary' title='Start mixing' onClick={() => this.handleShowTx0(utxo)} >Mix <Icon.ChevronsRight size={12}/></button>}
              </td>
            </tr>
          })}
          {false && <todo>
            <tr>
              <th scope="row">1</th>
              <td>
                <small>9353e3c299b84fc3...02e0c:8</small>
              </td>
              <td>0.28</td>
              <td>0.01btc</td>
              <td><span className='text-primary'>TX0</span></td>
              <td>
                <div className="progress">
                  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                       aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: '100%' }}>
                    TX0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                </div>
              </td>
              <td>5s ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='Stop'><Icon.Square size={12}/></button>
              </td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.64</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>26d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.014</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>31d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">4</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.1241</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>41d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.0014</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>73d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">5</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.1083</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>82d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">6</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.31</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>26d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">7</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>1.2</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>128d ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
            <tr>
              <th scope="row">8</th>
              <td>
                <small>198787d1085b1d94...c8476:1</small>
              </td>
              <td>0.04</td>
              <td>-</td>
              <td>READY</td>
              <td>

              </td>
              <td>2 years ago</td>
              <td>
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShowTx0}><Icon.Plus size={12}/>
                </button>
              </td>
            </tr>
          </todo>
          }
          </tbody>
        </table>
        </div>

      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    wallet: state.wallet
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    walletActions: bindActionCreators(walletActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositPage);
