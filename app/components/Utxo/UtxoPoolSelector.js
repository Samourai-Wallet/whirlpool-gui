/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import utils, { WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import moment from 'moment';

/* eslint-disable react/prefer-stateless-function */
class UtxoPoolSelector extends React.PureComponent {

  computePools(utxo) {
    if (utxo.account === WHIRLPOOL_ACCOUNTS.DEPOSIT) {
      return mixService.getPoolsForTx0(utxo)
    }
    return mixService.getPoolsForMix(utxo)
  }

  computePoolLabel(poolId) {
    return poolId ? poolId : 'no pool'
  }

  render () {
    const utxo = this.props.utxo
    const pools = this.computePools(utxo);
    const activeLabel = this.computePoolLabel(utxo.poolId)
    return (
      <DropdownButton size='sm' variant="default" title={activeLabel} className='utxoPoolSelector'>
        {pools.map(pool => {
          const poolLabel = this.computePoolLabel(pool.poolId)
          return <Dropdown.Item key={utxo.poolId} href="#/action-1" active={utxo.poolId === pool.poolId}>{poolLabel}</Dropdown.Item>
        })}
        <Dropdown.Divider />
        <Dropdown.Item active={!utxo.poolId}>{this.computePoolLabel(undefined)}</Dropdown.Item>
      </DropdownButton>
    )
  }
}

export default UtxoPoolSelector
