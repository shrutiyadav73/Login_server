const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const initSwagger = require("./Swagger.helper");

const { UserMiddle, ValidatorMiddleware } = require("../middlewares");
const { getStoragePath } = require("../constant/Storage.constant");
const { getCorsConfigs } = require("../constant/ClientOrigins.constant");
const { BasicAuth } = require("../middlewares/Auth.middleware");

function ExpressApp() {
  const app = express();
  /* A middleware that allows cross-origin resource sharing, which means we can access our API from a
 domain other than it’s own. */
  app.use(cors(getCorsConfigs()));

  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
    })
  );

  // # Static Storage Resource URLs
  app.use("/storage", express.static(getStoragePath()));

  app.use(function (req, res, next) {
    global.currentHttpRequest = req;
    global.currentHttpResponse = res;
    next();
  });

  app.use(BasicAuth, ValidatorMiddleware, UserMiddle);

  // Start listen on http request
  app.get("/", (req, res) => {
    res.json({
      message: `Welcome to ${process.env.APP_NAME}, Current api version ${process.env.APP_VERSION}`,
    });
  });

  app.use("/api", require("../routers")(app));
  initSwagger(app);

  return app;
}

module.exports = ExpressApp;
