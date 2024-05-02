const fs = require("fs");
const { createDirIfNotExits } = require("../helpers/File.helper");

let logsDir = process.env.LOGS_DIR;

if (!fs.existsSync(logsDir)) {
  logsDir = `${process.cwd()}/logs`;
  createDirIfNotExits(logsDir);
}

function getLogsDirectory() {
  return logsDir;
}

function getErrorsLogDir() {
  const dir = `${logsDir}/error`;
  createDirIfNotExits(dir);
  return dir;
}

function getApplicationLogDir() {
  const dir = `${logsDir}/app`;
  createDirIfNotExits(dir);
  return dir;
}

function getLogFileName(file) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}_${file}`;
}

module.exports = {
  getLogsDirectory,
  getErrorsLogDir,
  getApplicationLogDir,
  getLogFileName,
};
