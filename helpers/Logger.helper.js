const { createLogger, format, transports } = require("winston");
const {
  getErrorsLogDir,
  getLogFileName,
  getApplicationLogDir,
  getLogsDirectory,
} = require("../constant/Logger.constant");
const { combine, timestamp, label, printf } = format;

const LOGGER_LEVEL =
  process.env.APP_ENVIRONMENT === "production" ? "http" : "silly";

const LoggingFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level}] (${label}) => ${message}`;
});

const WinstonLogger = createLogger({
  level: LOGGER_LEVEL,
  format: combine(timestamp(), LoggingFormat),
  transports: [
    new transports.File({
      filename: `${getErrorsLogDir()}/${getLogFileName("error.log")}`,
      level: "error",
    }),
    new transports.File({
      filename: `${getApplicationLogDir()}/${getLogFileName("app.log")}`,
    }),
    new transports.File({
      filename: `${getLogsDirectory()}/third-party/app/${getLogFileName(
        "app.log"
      )}`,
      format: format.json(),
    }),
    new transports.File({
      filename: `${getLogsDirectory()}/third-party/error/${getLogFileName(
        "error.log"
      )}`,
      level: "error",
      format: format.json(),
    }),
  ],
});

const Logger = {
  log() {
    WinstonLogger.log(...arguments);
  },
  error: (label, message) => {
    WinstonLogger.error(message, { label, user: "hello" });
  },
  warn: (label, message) => {
    WinstonLogger.warn(message, { label });
  },
  info: (label, message) => {
    WinstonLogger.info(message, { label });
  },
  http: (label, message) => {
    WinstonLogger.http(message, { label });
  },
  verbose: (label, message) => {
    WinstonLogger.verbose(message, { label });
  },
  debug: (label, message) => {
    WinstonLogger.debug(message, { label });
  },
  silly: (label, message) => {
    WinstonLogger.silly(message, { label });
  },
};

module.exports = Logger;
