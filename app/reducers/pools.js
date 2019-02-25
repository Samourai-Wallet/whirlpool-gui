// @flow
import type { Action } from './types';
import produce from 'immer';
import { POOLS_SET } from '../actions/poolsActions';

const initialState = {
  /*pools: {
    pools: []
  }*/
}

const reducer = produce((state, action) => {
  const payload = action.payload
  switch (action.type) {
    case POOLS_SET:
      state.pools = payload
      return
    default:
      return
  }
}, initialState)

export default reducer

