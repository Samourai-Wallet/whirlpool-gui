import electron from 'electron';
import { computeLogPath, logger } from './utils/logger';

/* shared with mainProcess */

export const DEFAULT_CLI_LOCAL = true
export const DEFAULT_CLIPORT = 8899

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

const app = (electron.app || electron.remote.app)

export const DL_PATH = app.getPath('userData')

export const CLI_LOG_FILE = computeLogPath('whirlpool-cli.log')
export const GUI_LOG_FILE = logger.getFile()
