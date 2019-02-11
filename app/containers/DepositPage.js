// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import './PremixPage.css';
import * as Icon from 'react-feather';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/wallet';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import utils from '../services/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from '@fortawesome/free-solid-svg-icons'

class DepositPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      show: false,
      depositAddress: undefined
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleNextDepositAddress = this.handleNextDepositAddress.bind(this)

    this.handleShow2 = this.handleShow2.bind(this);
    this.handleClose2 = this.handleClose2.bind(this);
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
      console.log('depositAddress='+depositAddress)
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

  handleClose2() {
    this.setState({ show2: false });
  }

  handleShow2() {
    this.setState({ show2: true });
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
            <div class='depositAddress'>
              <QRCode value={this.state.depositAddress} /><br/>
              <b>{this.state.depositAddress}</b> <a onClick={this.handleNextDepositAddress} title='Change deposit address'><FontAwesomeIcon icon={Icons.faRedo} /></a>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.show2} onHide={this.handleClose2} animation={false}>
          <Modal.Header>
            <Modal.Title>Add to premix </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This will split your UTXO and start mixing.<br/>
              <small style={{fontSize:'0.8em'}}>a68d9291104646e763ce5b1013ac99af25812db6bf45372d1f09dd9524e24824:6 (1.24btc)</small>.<br/><br/>
              Select a pool:
              <select className="form-control" id="exampleFormControlSelect1">
                <option>0.1btc (anonymity set: 5, connected: 4, last mix: 2m ago)</option>
                <option>0.05btc (anonymity set: 5, connected: 14, last mix: 12s ago)</option>
                <option>0.01btc (anonymity set: 5, connected: 28, last mix: 1m ago)</option>
              </select><br/>

              Mixs target: <select className="form-control col-sm-2" id="exampleFormControlSelect1">
              <option>1</option>
              <option selected>3</option>
              <option>5</option>
              <option>10</option>
              <option>∞</option>
            </select> (you can change this later)
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose2}>Close</Button>
            <Button onClick={this.handleClose2}>Start mixing</Button>
          </Modal.Footer>
        </Modal>

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
            <th scope="col">Last activity</th>
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
              <td><span className='text-primary'>{utxo.status}</span></td>
              <td></td>
              <td>{utxo.mixsDone}/{utxo.mixsTarget}</td>
              <td>{utxo.message}</td>
              <td>
                <button className='btn btn-sm btn-primary' title='Start mixing' onClick={this.handleShow2}>Mix <Icon.ChevronsRight size={12}/></button>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
                <button className='btn btn-sm btn-primary' title='TX0' onClick={this.handleShow2}><Icon.Plus size={12}/>
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
