function getAuthorizationToken() {
  try {
    return currentHttpRequest.headers["authorization"].split(" ")[1];
  } catch (error) {
    return false;
  }
}

module.exports = {
  getAuthorizationToken,
};
