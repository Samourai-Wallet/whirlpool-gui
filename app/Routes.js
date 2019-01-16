import React from 'react';
import { Route, Switch } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import InitPage from './containers/InitPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.INIT} component={InitPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
