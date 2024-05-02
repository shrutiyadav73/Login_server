const StorageCleaner = require("./StorageCleaner.job");

function initJobs() {
  StorageCleaner();
}

module.exports = initJobs;
