import React from 'react';
import { Route, Switch } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import ConfigPage from './containers/ConfigPage';
import InitPage from './containers/InitPage';
import StatusPage from './containers/StatusPage';
import { Link } from "react-router-dom";
import DepositPage from './containers/DepositPage';

export default () => (
  <App>
    <div className="row">
      <nav className="col-md-2 d-none d-md-block bg-light sidebar">
        <div className="sidebar-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to={routes.DEPOSIT}>
                <a className="nav-link">
                  <span data-feather="plus"></span>
                  Deposit (8)
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link to={routes.STATUS}>
                <a className="nav-link">
                  <span data-feather="play"></span>
                  Mix (10)
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
  </App>
);
