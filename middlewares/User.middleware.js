const {
  getAdmin,
  getCustomer,
  isAuthProxyUrl,
} = require("../helpers/Common.helper");
const Logger = require("../helpers/Logger.helper");

module.exports = async (req, res, next) => {
  try {
    let user = {},
      admin = await getAdmin(),
      customer = await getCustomer();

    user = admin ? admin : customer ?? {};
    user.admin = admin;
    user.customer = customer;
    req.user = user;

    if (req.user.id || isAuthProxyUrl(req.originalUrl)) {
      next();
    }
  } catch (err) {
    Logger.debug("UserMiddleware", err.message);
    return reqFail(res, 401, "Authorization error invalid request");
  }
};
