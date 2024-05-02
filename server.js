require("dotenv").config();
global.m2s = require('mongoose-to-swagger')
const initConfigs = require("./configs/global.config");
const Logger = require("./helpers/Logger.helper");
// const initJobs = require("./jobs");
const ExpressUrlList = require("./helpers/ExpressUrlList.helper");
const ExpressApp = require("./helpers/ExpressApp.helper");
const PORT = process.env.APP_PORT || 5000;
const app = ExpressApp();

// Init Jobs & configs
// initJobs();
initConfigs();
require("./database/database")();

app.listen(PORT, () => {
  if (process.env.APP_ENVIRONMENT != "production") {
    ExpressUrlList(app);
  }

  print(`Application server started on port ${PORT}`);
  Logger.info("server.js", `Application server started on port ${PORT}`);
});
