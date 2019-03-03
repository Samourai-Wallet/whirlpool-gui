// @flow

export const CLI_SET = 'CLI_SET';

export const cliActions = {
  set: (cli) => {
    return {
      type: CLI_SET,
      payload: cli
    }
  }
}
