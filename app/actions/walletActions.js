// @flow

export const WALLET_SET = 'WALLET_SET';

export const walletActions = {
  set: (wallet) => {
    return {
      type: WALLET_SET,
      payload: wallet
    }
  }
}
