/**
 *
 * Status
 *
 */

import React from 'react';
import mixService from '../../services/mixService';
import { WHIRLPOOL_ACCOUNTS } from '../../services/utils';
import { Dropdown, DropdownButton } from 'react-bootstrap';

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
          return <Dropdown.Item key={utxo.poolId} active={utxo.poolId === pool.poolId} onClick={() => mixService.setPoolId(utxo, pool.poolId)}>{poolLabel}</Dropdown.Item>
        })}
        <Dropdown.Divider />
        <Dropdown.Item active={!utxo.poolId} onClick={() => mixService.setPoolId(utxo, undefined)}>{this.computePoolLabel(undefined)}</Dropdown.Item>
      </DropdownButton>
    )
  }
}

export default UtxoPoolSelector
