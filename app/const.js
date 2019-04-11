import electron from 'electron';
import {version} from '../package.json';
import { computeLogPath, logger } from './utils/logger';

/* shared with mainProcess */

export const API_VERSION = '0.3'
export const GUI_VERSION = version

export const DEFAULT_CLI_LOCAL = true;
export const DEFAULT_CLIPORT = 8899;

export const IPC_CLILOCAL = {
  GET_STATE: 'cliLocal.getState',
  STATE: 'cliLocal.state',
  RELOAD: 'cliLocal.reload'
};
export const CLILOCAL_STATUS = {
  DOWNLOADING: 'DOWNLOADING',
  ERROR: 'ERROR',
  READY: 'READY'
};
export const WHIRLPOOL_SERVER = {
  TEST: 'Whirlpool TESTNET',
  MAIN: 'Whirlpool MAINNET'
};

export const STORE_CLILOCAL = 'cli.local';

const app = electron.app || electron.remote.app;

export const DL_PATH = app.getPath('userData');

export const CLI_LOG_FILE = computeLogPath('whirlpool-cli.log');
export const GUI_LOG_FILE = logger.getFile();
