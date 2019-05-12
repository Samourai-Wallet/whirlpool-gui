import React from 'react';
import utils from '../../services/utils';

/* eslint-disable react/prefer-stateless-function */
class LinkExternal extends React.PureComponent {

  render () {
    return (
      <a href='#' onClick={e => {utils.openExternal(this.props.href);e.preventDefault()}}>{this.props.children}</a>
    )
  }
}

export default LinkExternal
