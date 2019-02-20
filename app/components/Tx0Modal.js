// @flow
import React, { Component } from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import '../containers/PremixPage.css';
import moment from 'moment';
import walletService from '../services/walletService';
import utils from '../services/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import backendService from '../services/backendService';

export default class DepositPage extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      pools: undefined,
      poolId: undefined,
      mixsTarget: 0,
      error: undefined,
      loaded: false
    };

    // fetch pools for tx0
    if (props.utxo) {
      backendService.tx0.fetchPools(props.utxo.value).then(poolsResponse => {
        console.log('poolsResponse', poolsResponse)
        const pools = poolsResponse.pools

        let error = undefined
        if (pools.length == 0) {
          error = "No pool found for this utxo value."
        }
        this.setState({
          pools: pools,
          poolId: pools.length > 0 ? pools[0].poolId : undefined,
          mixsTarget: 0,
          error: error,
          loaded: true
        })
      })
    }

    this.handleChangePoolTx0 = this.handleChangePoolTx0.bind(this);
    this.handleChangeMixsTargetTx0 = this.handleChangeMixsTargetTx0.bind(this);
    this.handleSubmitTx0 = this.handleSubmitTx0.bind(this)

  }

  handleChangePoolTx0(e) {
    const poolId = e.target.value

    this.setState({
      poolId: poolId
    })
  }

  handleChangeMixsTargetTx0(e) {
    const mixsTarget = parseInt(e.target.value)

    this.setState({
      mixsTarget: mixsTarget
    })
  }

  handleSubmitTx0() {
    backendService.tx0.create(this.props.utxo.hash, this.props.utxo.index, this.state.poolId, this.state.mixsTarget).then((tx0Response) => {
      console.log('tx0Response',tx0Response)
      walletService.fetchState()
    })
    this.props.onClose();
  }

  render() {
    return (
      <Modal show={true} onHide={this.props.onClose} dialogClassName="modal-tx0">
        <Modal.Header>
          <Modal.Title>Add to premix<br/>
            <small>{this.props.utxo.hash}:{this.props.utxo.index}</small></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            This will split your UTXO and start mixing.<br/>
            Value: <strong>{utils.toBtc(this.props.utxo.value)}btc</strong><br/>
            <br/>

            {this.state.loaded && this.state.error && (
              <Alert variant='danger'>{this.state.error}</Alert>
            )}
            {this.state.loaded && !this.state.error && (
              <div>
                Select a pool:
                <select className="form-control" onChange={this.handleChangePoolTx0} defaultValue={this.state.poolId}>
                  {this.state.pools.map(pool => <option key={pool.poolId} value={pool.poolId}>{pool.poolId} (denomination: {utils.toBtc(pool.denomination)}btc, anonymity set: {pool.mixAnonymitySet}, connected: {pool.nbRegistered}, last mix: {moment.duration(pool.elapsedTime).humanize()})</option>)}
                </select><br/>

                Mixs target:
                <select className="form-control col-sm-2" onChange={this.handleChangeMixsTargetTx0} defaultValue={this.state.mixsTarget}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={0}>∞</option>
                </select> (you can change this later)
              </div>
            )}
        </Modal.Body>
        <Modal.Footer>
          {!this.state.loaded && <div className="modal-status">
            <div className="spinner-border spinner-border-sm" role="status"/> Fetching pools for tx0...
          </div>}
          <Button variant="secondary" onClick={this.props.onClose}>Close</Button>
          {this.state.loaded && !this.state.error && <Button onClick={this.handleSubmitTx0}>Start mixing</Button>}
        </Modal.Footer>
      </Modal>
    );
  }
}
