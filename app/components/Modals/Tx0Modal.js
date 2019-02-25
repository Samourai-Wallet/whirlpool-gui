// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import utils from '../../services/utils';
import mixService from '../../services/mixService';
import AbstractModal from './AbstractModal';
import poolsService from '../../services/poolsService';

export default class Tx0Modal extends AbstractModal {
  constructor(props) {
    const initialState = {
      pools: undefined,
      poolId: undefined,
      mixsTarget: 0
    }
    super(props, 'modal-tx0', initialState)

    // fetch pools for tx0
    this.loading("Fetching pools for tx0...", poolsService.fetchState().then(foo => {
      const pools = mixService.getPoolsForTx0(props.utxo)

      if (pools.length == 0) {
        this.setError("No pool applicable to this utxo.")
      }
      this.setState({
        pools: pools,
        poolId: pools.length > 0 ? pools[0].poolId : undefined,
        mixsTarget: 0
      })
    }))

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
    mixService.tx0(this.props.utxo, this.state.poolId, this.state.mixsTarget)
    this.props.onClose();
  }

  renderTitle() {
    return <div>
      Add to premix<br/>
      <small>{this.props.utxo.hash}:{this.props.utxo.index}</small>
    </div>
  }

  renderButtons() {
    return <Button onClick={this.handleSubmitTx0}>Tx0</Button>
  }

  renderBody() {
    return <div>
      This will split your UTXO and start mixing.<br/>
      Value: <strong>{utils.toBtc(this.props.utxo.value)}btc</strong><br/>
      <br/>
      {!this.isLoading() && !this.isError() && <div>
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
      </div>}
    </div>
  }
}
