/**
 *
 * Status
 *
 */

import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

/* eslint-disable react/prefer-stateless-function */
class UtxoMixsTargetSelector extends React.PureComponent {

  render () {
    const utxo = this.props.utxo
    const targets = {
      1:1,
      2:2,
      3:3,
      5:5,
      10:10
    }

    return (
      <DropdownButton size='sm' variant="default" title={utxo.mixsDone+' / '+utxo.mixsTarget} className='utxoMixsTargetSelector'>
        {Object.keys(targets).map(value => {
          value = parseInt(value)
          const label = targets[value]
          return <Dropdown.Item key={value} active={value === utxo.mixsTarget}>{label}</Dropdown.Item>
        })}
        <Dropdown.Divider />
        <Dropdown.Item active={!utxo.mixsTarget}>∞</Dropdown.Item>
      </DropdownButton>
    )
  }
}

export default UtxoMixsTargetSelector
