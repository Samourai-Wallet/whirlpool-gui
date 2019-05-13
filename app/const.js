import electron from 'electron';
import { version } from '../package.json';
import { computeLogPath, logger } from './utils/logger';

/* shared with mainProcess */

export const API_VERSION = '0.5';
export const GUI_VERSION = version;

export const DEFAULT_CLI_LOCAL = true;
export const DEFAULT_CLIPORT = 8899;

export const IPC_CLILOCAL = {
  GET_STATE: 'cliLocal.getState',
  STATE: 'cliLocal.state',
  RELOAD: 'cliLocal.reload',
  DELETE_CONFIG: 'cliLocal.deleteConfig'
};
export const CLILOCAL_STATUS = {
  DOWNLOADING: 'DOWNLOADING',
  ERROR: 'ERROR',
  READY: 'READY'
};
export const WHIRLPOOL_SERVER = {
  TESTNET: 'Whirlpool TESTNET',
  MAINNET: 'Whirlpool MAINNET',
  INTEGRATION: 'Whirlpool INTEGRATION'
};

export const STORE_CLILOCAL = 'cli.local';

const app = electron.app || electron.remote.app;

export const IS_DEV = (process.env.NODE_ENV === 'development')
const DL_PATH_DEV = '/zl/workspaces/whirlpool/whirlpool-client-cli4/target/'
export const DL_PATH = IS_DEV ? DL_PATH_DEV : app.getPath('userData');

export const CLI_LOG_FILE = computeLogPath('whirlpool-cli.log');
export const CLI_LOG_ERROR_FILE = computeLogPath('whirlpool-cli.error.log');
export const GUI_LOG_FILE = logger.getFile();
export const CLI_CONFIG_FILENAME = 'whirlpool-cli-config.properties';

