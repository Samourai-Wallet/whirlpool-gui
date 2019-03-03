// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import cli from './cli';
import wallet from './wallet';
import mix from './mix';
import status from './status';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    cli: cli,
    wallet: wallet,
    status: status,
    mix: mix
  });
}
