// @flow
import type { Action } from './types';
import produce from 'immer';
import moment from 'moment';
import {
  ACTION_APP_STATUS_ITEM_ADD,
  ACTION_APP_STATUS_ITEM_CLEAR,
  ACTION_APP_STATUS_ITEM_ERROR,
  ACTION_APP_STATUS_ITEM_SUCCESS
} from '../services/statusActions';

const initialState = {items: {}}

const reducer = produce((state, action) => {
  const payload = action.payload
  switch (action.type) {
    case ACTION_APP_STATUS_ITEM_ADD: {
      payload.time = moment().valueOf()
      state.items[payload.id] = payload
      return
    }
    case ACTION_APP_STATUS_ITEM_SUCCESS: {
      const statusItem = state.items[payload.id]
      if (statusItem === undefined) {
        return
      }
      statusItem.success = true
      return
    }
    case ACTION_APP_STATUS_ITEM_ERROR: {
      const statusItem = state.items[payload.id]
      if (statusItem === undefined) {
        return
      }
      statusItem.error = true
      statusItem.errorMessage = payload.errorMessage
      return
    }
    case ACTION_APP_STATUS_ITEM_CLEAR: {
      delete state.items[payload.id]
    }
    default:
      return
  }
}, initialState)

export default reducer

