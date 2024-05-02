const { LocalStorage } = require("node-localstorage");

function print() {
  if (process.env.APP_ENVIRONMENT != "production") console.log(...arguments);
}

module.exports = function globalConfig() {
  global.yup = require("yup");
  global.print = print;
  global.localStorage = new LocalStorage(
    `${process.cwd()}/database/localStorage`
  );
  global.m2s = require("mongoose-to-swagger");
  // require("../events");
};
