// @flow

export const POOLS_SET = 'POOLS_SET';

export const poolsActions = {
  set: (pools) => {
    return {
      type: POOLS_SET,
      payload: pools
    }
  }
}
