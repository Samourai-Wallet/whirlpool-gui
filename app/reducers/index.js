// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import wallet from './wallet';
import status from './status';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    wallet: wallet,
    status: status
  });
}
