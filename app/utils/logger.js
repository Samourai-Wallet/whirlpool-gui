import log from 'electron-log'
import findLogPath from "electron-log/lib/transports/file/findLogPath";
import electron from "electron";

export const computeLogPath = (fileName) => {
  const app = (electron.app || electron.remote.app)
  return findLogPath(app.getName(), fileName)
}

const GUI_LOG_FILENAME='whirlpool-gui.log'
class Logger {

  constructor(fileName, level='info') {
    log.transports.file.fileName = fileName
    this.setLevel(level)
  }

  error(...args) {
    return log.error(args)
  }

  warn(...args) {
    return log.warn(args)
  }

  info(...args) {
    return log.info(args)
  }

  verbose(...args) {
    return log.verbose(args)
  }

  debug(...args) {
    return log.debug(args)
  }

  setLevel(level) {
    log.transports.file.level = level;
  }

  getFile() {
    return computeLogPath(log.transports.file.fileName)
  }
}

export const logger = new Logger(GUI_LOG_FILENAME)
