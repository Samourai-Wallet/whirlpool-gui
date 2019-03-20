/* shared with mainProcess */

export const DEFAULT_CLI_LOCAL = true

export const IPC_CLILOCAL = {
  GET_STATE: 'cliLocal.getState',
  STATE: 'cliLocal.state',
  RELOAD: 'cliLocal.reload'
}
export const CLILOCAL_STATUS = {
  DOWNLOADING: 'DOWNLOADING',
  ERROR: 'ERROR',
  READY: 'READY'
}

export const STORE_CLILOCAL = "cli.local"

export const getDlPath = (app) => app.getPath('userData')
export const getCliLogFile = (app) => {
  return getDlPath(app)+'/whirlpool-cli.log'
}
export const getGuiLogFile = (app) => {
  return getDlPath(app)+'/whirlpool-gui.log'
}
