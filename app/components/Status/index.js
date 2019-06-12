/**
 *
 * Status
 *
 */

import React from 'react';
import StatusItem from './statusItem';

/* eslint-disable react/prefer-stateless-function */
class Status extends React.PureComponent {
  render () {
    return (
      <div className='status'>
        {Object.values(this.props.status.items)
          .sort((item1, item2) => item1.time - item2.time)
          .map(item => (
            <StatusItem
              item={item}
              key={item.id}
              onClear={() => this.props.statusActions.clear(item.id)}
              onRetry={() => this.props.statusActions.retry(item.id)}
            />
          ))}
      </div>
    )
  }
}

Status.propTypes = {}

export default Status
