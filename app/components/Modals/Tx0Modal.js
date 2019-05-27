// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import * as Icon from 'react-feather';
import utils from '../../services/utils';
import mixService from '../../services/mixService';
import AbstractModal from './AbstractModal';
import poolsService from '../../services/poolsService';
import { TX0_FEE_TARGET } from '../../const';

export default class Tx0Modal extends AbstractModal {
  constructor(props) {
    const initialState = {
      pools: undefined,
      feeTarget: TX0_FEE_TARGET.BLOCKS_2.value,
      poolId: props.utxo.poolId,
      mixsTarget: props.utxo.mixsTarget > 0 ? props.utxo.mixsTarget : 0
    }
    super(props, 'modal-tx0', initialState)

    console.log('Tx0Modal', initialState)

    // fetch pools for tx0
    this.loading("Fetching pools for tx0...", poolsService.fetchState().then(foo => {
      const pools = mixService.getPoolsForTx0(props.utxo)

      if (pools.length == 0) {
        this.setError("No pool for this utxo.")
      }

      // default poolId
      if (!initialState.poolId) {
        initialState.poolId = pools.length > 0 ? pools[0].poolId : undefined
      }
      initialState.pools = pools
      this.setState(initialState)
    }))

    this.handleChangeFeeTarget = this.handleChangeFeeTarget.bind(this);
    this.handleChangePoolTx0 = this.handleChangePoolTx0.bind(this);
    this.handleChangeMixsTargetTx0 = this.handleChangeMixsTargetTx0.bind(this);
    this.handleSubmitTx0 = this.handleSubmitTx0.bind(this)
  }

  handleChangeFeeTarget(e) {
    const feeTarget = e.target.value

    this.setState({
      feeTarget: feeTarget
    })
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
    mixService.tx0(this.props.utxo, this.state.feeTarget, this.state.poolId, this.state.mixsTarget)
    this.props.onClose();
  }

  renderTitle() {
    return <div>
      TX0: <small>{this.props.utxo.hash}:{this.props.utxo.index}</small>
    </div>
  }

  renderButtons() {
    return <Button onClick={this.handleSubmitTx0}>Tx0 <Icon.ChevronsRight size={12}/></Button>
  }

  renderBody() {
    return <div>
      This will split your deposit UTXO and start mixing.<br/>
      Value: <strong>{utils.toBtc(this.props.utxo.value)}btc</strong><br/>
      <br/>
      {!this.isLoading() && !this.isError() && <div>
        Miner fee:
        <select className="form-control" onChange={this.handleChangeFeeTarget} defaultValue={this.state.feeTarget}>
          {Object.keys(TX0_FEE_TARGET).map(feeTargetKey => {
            const feeTargetItem = TX0_FEE_TARGET[feeTargetKey]
            return <option key={feeTargetItem.value} value={feeTargetItem.value}>{feeTargetItem.label}</option>
          })}
        </select><br/>

        Pool:
        <select className="form-control" onChange={this.handleChangePoolTx0} defaultValue={this.state.poolId}>
          {this.state.pools.map(pool => <option key={pool.poolId} value={pool.poolId}>{pool.poolId} · denomination: {utils.toBtc(pool.denomination)}btc · fee: {utils.toBtc(pool.feeValue)}btc · anonymity set: {pool.mixAnonymitySet}}</option>)}
        </select><br/>

        Mixs target: (you can change this later)
        <select className="form-control col-sm-2" onChange={this.handleChangeMixsTargetTx0} defaultValue={this.state.mixsTarget}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={0}>∞</option>
        </select>
      </div>}
    </div>
  }
}
