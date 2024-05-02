const envClientOrigins = process.env.CLIENT_ORIGINS ?? "";
let ClientOrigins = [];

if (envClientOrigins) ClientOrigins = envClientOrigins.split(", ");

function getCorsConfigs() {
  return {
    origin: function (origin, callback) {
      if (origin == undefined) return callback(null, true);
      if (ClientOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };
}

module.exports = {
  getCorsConfigs,
  ClientOrigins,
};
