// @flow
import * as React from 'react';
import { Route, Switch, withRouter } from 'react-router';
import backendService from '../services/backendService';
import { connect } from 'react-redux';
import moment from 'moment';
import walletService from '../services/walletService';
import { bindActionCreators } from 'redux';
import { cliActions } from '../actions/cliActions';
import { walletActions } from '../actions/walletActions';
import { poolsActions } from '../actions/poolsActions';
import { mixActions } from '../actions/mixActions';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import routes from '../constants/routes';
import ConfigPage from '../containers/ConfigPage';
import InitPage from '../containers/InitPage';
import PremixPage from './PremixPage';
import DepositPage from '../containers/DepositPage';
import HomePage from './HomePage';
import Status from '../components/Status';
import { statusActions } from '../services/statusActions';
import PostmixPage from './PostmixPage';
import utils from '../services/utils';
import MixStatus from '../components/MixStatus';
import mixService from '../services/mixService';
import modalService from '../services/modalService';
import Tx0Modal from '../components/Modals/Tx0Modal';
import DepositModal from '../components/Modals/DepositModal';
import poolsService from '../services/poolsService';
import cliService from '../services/cliService';
import ConnectingPage from './ConnectingPage';
import LoginPage from './LoginPage';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cliLocalService } from '../services/cliLocalService';

type Props = {
  children: React.Node
};

class App extends React.Component<Props> {
  props: Props;

  constructor(props) {
    super(props)

    this.state = {
      // managed by modalService
      modalTx0: false
    }

    // init services
    backendService.init(props.dispatch)
    cliService.init(props.cli, cliState =>
      props.cliActions.set(cliState)
    )
    mixService.init(props.mix, mixState =>
      props.mixActions.set(mixState)
    )
    walletService.init(props.wallet, walletState =>
      props.walletActions.set(walletState)
    )
    poolsService.init(props.pools, poolsState =>
      props.poolsActions.set(poolsState)
    )
    modalService.init(this.setState.bind(this))

    // start cli
    cliService.start()
  }

  getCliStatusIcon() {
    if (cliService.isCliStatusReady()) {
      // connected & ready
      return <FontAwesomeIcon icon={Icons.faWifi} color='green' title='Connected' size='xs'/>
    }
    if (cliService.getCliUrlError()) {
      // not connected
      return <FontAwesomeIcon icon={Icons.faWifi} color='red' title='Disconnected' />
    }
    // connected & initialization required
    if (cliService.isCliStatusNotInitialized()) {
      return <FontAwesomeIcon icon={Icons.faWifi} color='orange' title='Connected, cli initialization required'/>
    }
    // connected & not ready
    if (cliService.isConnected()) {
      return <FontAwesomeIcon icon={Icons.faWifi} color='yellow' title={'Connected, not ready: '+cliService.getCliMessage()}/>
    }
  }

  getCliLocalStatusIcon() {
    let infoError = ""
    if (cliLocalService.getError() != undefined) {
      infoError = cliLocalService.getError()+'. '
    }
    if (cliLocalService.getInfo() != undefined) {
      infoError += cliLocalService.getInfo()
    }
    // downloading
    if (cliLocalService.isStatusDownloading()) {
      return <FontAwesomeIcon icon={Icons.faPlay} color='orange' title={'CLI.local is being downloaded... '+infoError}/>
    }
    // error
    if (cliLocalService.isStatusError()) {
      return <FontAwesomeIcon icon={Icons.faCircle} color='red' title={'CLI.local error: '+infoError}/>
    }
    if (cliLocalService.isStarted()) {
      // started
      return <FontAwesomeIcon icon={Icons.faPlay} color='green' title={'CLI.local is running since '+moment(cliLocalService.getStartTime()).format()} size='xs'/>
    }
    if (!cliLocalService.isValid()) {
      // invalid
      return <FontAwesomeIcon icon={Icons.faCircle} color='red' title={'CLI.local executable is not valid. '+infoError} size='xs'/>
    }
    // valid but stopped
    return <FontAwesomeIcon icon={Icons.faStop} color='orange' title={'CLI.local is not running. '+infoError} />
  }

  getLoginStatusIcon() {
    if (cliService.isLoggedIn()) {
      // logged in
      return <a href='#' onClick={()=>cliService.logout()}><FontAwesomeIcon icon={Icons.faUser} color='green' title='Logged in (click to logout)' /></a>
    }
    return <FontAwesomeIcon icon={Icons.faUserSlash} color='grey' title='Logged out' />
  }

  routes() {
    if (cliService.isLoggedIn()) {
      // logged in
      return <Switch>
        <Route path={routes.DEPOSIT} component={DepositPage}/>
        <Route path={routes.PREMIX} component={PremixPage}/>
        <Route path={routes.POSTMIX} component={PostmixPage}/>
        <Route path={routes.CONFIG} component={ConfigPage}/>
        <Route path={routes.HOME} component={HomePage}/>
      </Switch>
    }

    if (!cliService.isConfigured() || cliService.isCliStatusNotInitialized()) {
      // not configured/initialized
      return <Switch>
        <Route path={routes.HOME} component={InitPage} />
      </Switch>
    }
    if (!cliService.isCliStatusReady()) {
      // not connected
      return <Switch>
        <Route path={routes.HOME} component={ConnectingPage} />
      </Switch>
    }
    if (!cliService.isLoggedIn()) {
      return <Switch>
        <Route path={routes.HOME} component={LoginPage}/>
      </Switch>
    }
  }

  render() {
    const cliLocalStatusIcon = cliService.isCliLocal() ? this.getCliLocalStatusIcon() : undefined
    const cliStatusIcon = this.getCliStatusIcon()
    const loginStatusIcon = this.getLoginStatusIcon()
    const cliUrl = cliService.isCliLocal() ? 'local CLI' : cliService.getCliUrl()
    return <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div className='col-sm-3 col-md-2 mr-0 navbar-brand-col'>

          <div className="branding">
            <a href='#' className="brand-logo">
              <span className="logo icon-samourai-logo-trans svglogo"></span>
            </a>
            <a href='#' className='product-title'>Whirlpool</a>
          </div>
          <div>
            {loginStatusIcon && <div className='loginStatus'>{loginStatusIcon}</div>}
            {cliStatusIcon && <div className='cliStatus'>{cliLocalStatusIcon} {cliUrl} {cliStatusIcon}</div>}
          </div>
        </div>
        <div className='col-md-10'>
          {cliService.isLoggedIn() && (mixService.isReady() ? <MixStatus mixState={this.props.mix} mixActions={this.props.mixActions}/> : <small>Fetching mix state...</small>)}
        </div>
      </nav>

      <div className="container-fluid">

        <div className="row">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            {cliService.isLoggedIn() && <div className="sidebar-sticky">
              <button className='btn btn-sm btn-primary btn-deposit' onClick={() => modalService.openDeposit()}>
                <Icon.Plus size={12}/> Deposit
              </button>
              <ul className="nav flex-column">
                {walletService.isReady() && <li className="nav-item">
                  <Link to={routes.DEPOSIT}>
                    <a className="nav-link">
                      <span data-feather="plus"></span>
                      Deposit
                      ({walletService.getUtxosDeposit().length} · {utils.toBtc(walletService.getBalanceDeposit(), true)})
                    </a>
                  </Link>
                </li>}
                {walletService.isReady() && <li className="nav-item">
                  <Link to={routes.PREMIX}>
                    <a className="nav-link">
                      <span data-feather="play"></span>
                      Mixing
                      ({walletService.getUtxosPremix().length} · {utils.toBtc(walletService.getBalancePremix(), true)})
                    </a>
                  </Link>
                </li>}
                {walletService.isReady() && <li className="nav-item">
                  <Link to={routes.POSTMIX}>
                    <a className="nav-link">
                      <span data-feather="check"></span>
                      Mixed
                      ({walletService.getUtxosPostmix().length} · {utils.toBtc(walletService.getBalancePostmix(), true)})
                    </a>
                  </Link>
                </li>}
                <li className="nav-item">
                  <Link to={routes.CONFIG}>
                    <a className="nav-link">
                      <span data-feather="settings"></span>
                      Configuration
                    </a>
                  </Link>
                </li>
              </ul>
              {!walletService.isReady() && <div>
                <small>Fetching wallet...</small>
              </div>}
            </div>}
            <Status
              status={this.props.status}
              statusActions={this.props.statusActions}
            />
          </nav>

          <main role="main" className="col-md-10 ml-sm-auto col-lg-10 px-4">

            {this.routes()}

            {this.state.modalTx0 && <Tx0Modal utxo={this.state.modalTx0} onClose={modalService.close.bind(modalService)}/>}
            {this.state.modalDeposit && <DepositModal onClose={modalService.close.bind(modalService)}/>}

          </main>
        </div>

      </div>
    </div>
  }
}


function mapStateToProps(state) {
  return {
    status: state.status,
    cli: state.cli,
    wallet: state.wallet,
    mix: state.mix
  };
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    statusActions: bindActionCreators(statusActions, dispatch),
    cliActions: bindActionCreators(cliActions, dispatch),
    walletActions: bindActionCreators(walletActions, dispatch),
    poolsActions: bindActionCreators(poolsActions, dispatch),
    mixActions: bindActionCreators(mixActions, dispatch)
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));
