// @flow
import type { Action } from './types';
import produce from 'immer';
import { GUI_SET } from '../actions/guiActions';

const initialState = {
  /*gui: {
    status: 'NOT_INITIALIZED'
  }*/
}

const reducer = produce((state, action) => {
  const payload = action.payload
  switch (action.type) {
    case GUI_SET:
      state.gui = payload
      return
    default:
      return
  }
}, initialState)

export default reducer

