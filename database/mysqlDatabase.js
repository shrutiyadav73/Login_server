const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = new Sequelize("InviEcom", "root", "Muskan@123", {
  host: "localhost",
  logging: false,
  dialect: "mysql",
});

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.log("unable to connect to the database:", error);
}

// const db={};
// db.Sequelize=Sequelize;
// db.sequelize=sequelize;
