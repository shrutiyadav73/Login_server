const mongoose = require("mongoose");
const Logger = require("../helpers/Logger.helper");
require("dotenv").config();

function initializeMongoDB() {
  const MONGO_DB_URL =
    process.env.MONGO_DB_URL ??
    (process.env.APP_ENVIRONMENT == "production"
      ? `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_SERVER_CLUSTER}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
      : `mongodb://localhost:27017/${
          process.env.MONGO_DB_NAME || "local_template_db"
        }`);

  mongoose.connect(
    MONGO_DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    function (err) {
      if (err) {
        console.error("MongoDB connection error: " + err);
      }
    }
  );

  mongoose.set("strictQuery", true);

  mongoose.connection
    .on("error", console.error.bind(console, "connection error: "))
    .once("open", function () {
      Logger.info(
        "DATABASE",
        `Database connected successfully with ${mongoose.connection.name}`
      );
    });
}

module.exports = initializeMongoDB;
