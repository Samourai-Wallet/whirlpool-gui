/**
 *
 * Status
 *
 */

import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import mixService from '../../services/mixService';
import { MIXSTARGET_UNLIMITED } from '../../services/utils';
import utils from '../../services/utils';

/* eslint-disable react/prefer-stateless-function */
class UtxoMixsTargetSelector extends React.PureComponent {

  render () {
    const utxo = this.props.utxo
    const targets = [1, 2, 3, 5, 10, 25, 50, 100, MIXSTARGET_UNLIMITED]

    return (
      <DropdownButton size='sm' variant="default" title={utxo.mixsDone+' / '+utils.mixsTargetLabel(utxo.mixsTarget)} className='utxoMixsTargetSelector'>
        {targets.map(value => {
          value = parseInt(value)
          const label = utils.mixsTargetLabel(value)
          return <Dropdown.Item key={value} active={value === utxo.mixsTarget} onClick={() => mixService.setMixsTarget(utxo, value)}>{label}</Dropdown.Item>
        })}
      </DropdownButton>
    )
  }
}

export default UtxoMixsTargetSelector
