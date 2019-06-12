// @flow
import type { Action } from './types';
import produce from 'immer';
import { CLI_SET } from '../actions/cliActions';

const initialState = {
  /*cli: {
    status: 'NOT_INITIALIZED'
  }*/
}

const reducer = produce((state, action) => {
  const payload = action.payload
  switch (action.type) {
    case CLI_SET:
      state.cli = payload
      return
    default:
      return
  }
}, initialState)

export default reducer

