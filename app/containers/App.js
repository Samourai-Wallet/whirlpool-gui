// @flow
import * as React from 'react';
import backendService from '../services/backendService';
import { connect } from 'react-redux';
import walletService from '../services/walletService';
import { bindActionCreators } from 'redux';
import { walletActions } from '../actions/wallet';
import { Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import routes from '../constants/routes';
import ConfigPage from '../containers/ConfigPage';
import InitPage from '../containers/InitPage';
import StatusPage from '../containers/StatusPage';
import DepositPage from '../containers/DepositPage';
import Status from '../components/Status';
import { statusActions } from '../services/statusActions';

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
    const utxosDeposit = walletService.getUtxosDeposit()
    const utxosPremix = walletService.getUtxosPremix()
    const utxosPostmix = walletService.getUtxosPostmix()

    return <div className="row">
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <div className="sidebar-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to={routes.DEPOSIT}>
                <a className="nav-link">
                  <span data-feather="plus"></span>
                  Deposit ({utxosDeposit.length})
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link to={routes.STATUS}>
                <a className="nav-link">
                  <span data-feather="play"></span>
                  Mix ({utxosPremix.length})
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link to={routes.CONFIG}>
                <a className="nav-link">
                  <span data-feather="settings"></span>
                  Configuration
                </a>
              </Link>
            </li>
          </ul>
        </div>
        <Status
          status={this.props.status}
          statusActions={this.props.statusActions}
        />
      </nav>

      <main role="main" className="col-md-10 ml-sm-auto col-lg-10 px-4">

        <Switch>
          <Route path={routes.STATUS} component={StatusPage} />
          <Route path={routes.DEPOSIT} component={DepositPage} />
          <Route path={routes.CONFIG} component={ConfigPage} />
          <Route path={routes.INIT} component={InitPage} />
        </Switch>

      </main>
    </div>
  }
}


function mapStateToProps(state) {
  return {
    status: state.status,
    wallet: state.wallet
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    statusActions: bindActionCreators(statusActions, dispatch),
    walletActions: bindActionCreators(walletActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
