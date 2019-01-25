// @flow
import * as React from 'react';
import backendService from '../services/backendService';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import { bindActionCreators } from "redux";
import { walletActions } from '../actions/wallet';

type Props = {
  children: React.Node
};

class App extends React.Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    backendService.init(props.dispatch)

    walletService.init(props.wallet, walletState =>
      props.walletActions.set(walletState)
    )
    walletService.loadFromBackend()
  }

  render() {
    const { children } = this.props;
    return <React.Fragment>{children}</React.Fragment>;
  }
}


function mapStateToProps(state) {
  return {
    wallet: state.wallet
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    walletActions: bindActionCreators(walletActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
