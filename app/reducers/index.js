// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import cli from './cli';
import gui from './gui';
import wallet from './wallet';
import mix from './mix';
import pools from './pools';
import status from './status';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    cli: cli,
    gui: gui,
    wallet: wallet,
    status: status,
    mix: mix,
    pools: pools
  });
}
