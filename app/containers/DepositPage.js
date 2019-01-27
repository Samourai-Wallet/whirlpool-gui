// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './PremixPage.css';
import * as Icon from 'react-feather';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/wallet';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import utils from '../services/utils';

class DepositPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      show: false
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.handleShow2 = this.handleShow2.bind(this);
    this.handleClose2 = this.handleClose2.bind(this);
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
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
              Send funds to your deposit wallet: <b>tb1qp53r9j0rytsanrkgqa36nptnk3ds3zrzppuu66</b>.
            </p>
            <img src='data:image/png;base64,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'/>

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
            <th scope="col">Priority</th>
            <th scope="col">UTXO</th>
            <th scope="col">Amount</th>
            <th scope="col">Pool</th>
            <th scope="col">Status</th>
            <th scope="col"></th>
            <th scope="col">Last activity</th>
            <th scope="col"></th>
          </tr>
          </thead>
          <tbody>
          {utxosDeposit.map((utxo,i) => {
            return <tr key={i}>
              <th scope="row">{(i+1)}</th>
              <td>
                <small><a href={utils.linkExplorer(utxo)} target='_blank'>{utxo.hash}:{utxo.index}</a><br/>
                  {utxo.path} · {utxo.confirmations} confirms</small>
              </td>
              <td>{utils.toBtc(utxo.value)}</td>
              <td>-</td>
              <td><span className='text-primary'>READY</span></td>
              <td>

              </td>
              <td></td>
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
