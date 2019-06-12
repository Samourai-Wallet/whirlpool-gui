// @flow

export const MIX_START = 'MIX_START';
export const MIX_STOP = 'MIX_STOP';
export const MIX_SET = 'MIX_SET';

export const mixActions = {
  start: () => {
    return {
      type: MIX_START
    }
  },
  stop: () => {
    return {
      type: MIX_STOP
    }
  },
  set: (mix) => {
    return {
      type: MIX_SET,
      payload: mix
    }
  }
}
