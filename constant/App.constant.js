function getAppName() {
  return process.env.APP_NAME ?? "InviIMS";
}
function getAppUrl() {
  return process.env.APP_URL ?? null;
}

function getAppVersion() {
  return process.env.APP_VERSION ?? null;
}
function getAppSecretToken() {
  return process.env.JWT_SERVER_TOKEN ?? "something-else";
}

const CHROME_EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH ?? null;

module.exports = {
  getAppUrl,
  getAppVersion,
  getAppSecretToken,
  getAppName,
  CHROME_EXECUTABLE_PATH,
};
