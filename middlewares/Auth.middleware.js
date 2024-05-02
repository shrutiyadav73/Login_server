const { requestFail, reqFail } = require("../helpers/RequestResponse.helper");
const Logger = require("../helpers/Logger.helper");
const LoggerLabel = "Auth.middle | Authorization";
const { verifyJWT } = require("../helpers/JWT.helper");
const { getAuthorizationToken } = require("../helpers/HttpRequest.helper");
const { isAuthProxyUrl } = require("../helpers/Common.helper");

function BasicAuth(req, res, next) {
  Logger.http(LoggerLabel, `Authorizing user on ${req.originalUrl}`);

  // Check auth proxy
  if (isAuthProxyUrl(req.originalUrl)) {
    Logger.http(
      LoggerLabel,
      `Duo to auth proxy, Skipping authorization on ${req.originalUrl}`
    );
    return next();
  }

  // try to get user authorization token and verify
  try {
    const AuthToken = getAuthorizationToken();
    if (!AuthToken) {
      Logger.http(LoggerLabel, "Authorization token not found, Request fail");
      return reqFail(res, 401, "Authorization token not found");
    }

    // Verifying User Token
    if (verifyJWT(AuthToken)) {
      return next();
    } else {
      Logger.http(LoggerLabel, `Authorization failed for ${req.originalUrl}`);
      return reqFail(res, 401, "Invalid authorization token");
    }
  } catch (error) {
    Logger.http(
      LoggerLabel,
      "Unable to retrieve or verify user token, request fail"
    );
    return reqFail(res, 401, "Invalid authorization token");
  }
}

module.exports = { BasicAuth };
