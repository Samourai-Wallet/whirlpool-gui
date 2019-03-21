import electron from 'electron';
import { computeLogPath, logger } from './utils/logger';

/* shared with mainProcess */

export const CLI_FILENAME = "whirlpool-client-cli-develop-SNAPSHOT-run.jar";
export const CLI_URL = "https://file.io/7G4siX";
export const CLI_CHECKSUM = "a53ebe4f04551dc522c01d4b9e0f00bb";

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
