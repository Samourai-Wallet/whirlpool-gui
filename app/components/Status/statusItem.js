import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from '@fortawesome/free-solid-svg-icons'

class StatusItem extends React.PureComponent {
  render () {
    const item = this.props.item
    return (
      <div className='item' key={item.id}>
        {item.error && (
          <a onClick={() => this.props.onClear()} title='Click to clear'>
            <FontAwesomeIcon icon={Icons.faTimesCircle} color='red' />
          </a>
        )}
        {item.success && (
          <a onClick={() => this.props.onClear()} title='Click to clear'>
            <FontAwesomeIcon icon={Icons.faCheckCircle} color='green' />
          </a>
        )}
        {!item.error &&
        !item.success && (
          <a onClick={() => this.props.onClear()} title='Click to clear'>
            <FontAwesomeIcon icon={Icons.faSpinner} pulse />
          </a>
        )}
        &nbsp;<span className='mainLabel'>({item.mainLabel})</span>{' '}
        <span className='label'>{item.label}</span>
        &nbsp;{item.error && (
        <span>
            <span className='errorMessage'>{item.errorMessage}</span>&nbsp;
          <a onClick={() => this.props.onRetry()} title='Click to retry'>
              <FontAwesomeIcon icon={Icons.faRedo} />
            </a>
          </span>
      )}
      </div>
    )
  }
}

export default StatusItem
