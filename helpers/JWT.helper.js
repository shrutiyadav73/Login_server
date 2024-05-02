const jwt = require("jsonwebtoken");
const { getAppSecretToken } = require("../constant/App.constant");

const JWT_SALT_TOKEN = getAppSecretToken();

function generateJWT(data = null, config = { expiresIn: "10d" }) {
  return jwt.sign(data, JWT_SALT_TOKEN, config);
}

function verifyJWT(token) {
  try {
    return jwt.verify(token.trim(), JWT_SALT_TOKEN);
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateJWT,
  verifyJWT,
};
