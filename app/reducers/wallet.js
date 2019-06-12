// @flow
import { WALLET_SET } from '../actions/walletActions';
import type { Action } from './types';
import produce from 'immer';

const initialState = {
  /*wallet: {
    deposit: {
      utxos:[],
      balance:0
    },
    premix: {
      utxos:[],
      balance:0
    },
    postmix: {
      utxos:[],
      balance:0
    }
  }*/
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

