// @flow
import type { Action } from './types';
import produce from 'immer';
import { MIX_SET } from '../actions/mixActions';

const initialState = {
  /*mix: {
    started: false,
    nbMixing: 0,
    nbQueued:0,
    threads: []
  }*/
}

const reducer = produce((state, action) => {
  const payload = action.payload
  switch (action.type) {
    case MIX_SET:
      state.mix = payload
      return
    default:
      return
  }
}, initialState)

export default reducer

