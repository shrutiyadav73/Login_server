const { MONGO_DB_URL } = require("../configs");

class DBConfig {
  db = null;
  constructor() {
    mongodb.connect(
      MONGO_DB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      function (err, client) {
        db = client.db();
      }
    );
  }

  async get(key) {
    let data = await this.db.collection("app_configs").findOne({ key });
    return data && data.length > 0 ? data.value : null;
  }

  set(key, value) {
    db.collection("app_configs").insertOne({ key, value });
  }
}

module.exports = new DBConfig();
