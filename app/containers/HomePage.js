// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class HomePage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <h1>Welcome</h1>
      </div>
    );
  }

}
function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage);
