// @flow
import { WALLET_SET, DECREMENT_COUNTER } from '../actions/wallet';
import type { Action } from './types';
import produce from 'immer';

const initialState = {
  wallet: {
    utxosDeposit: [],
    utxosPremix: [],
    utxosPostmix: []
  }
}

const reducer = produce((state, action) => {
  const payload = action.payload
  switch (action.type) {
    case WALLET_SET:
      state.wallet = payload
      return
    default:
      return
  }
}, initialState)

export default reducer

