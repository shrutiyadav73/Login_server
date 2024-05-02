const AppConfigModel = require("../models/utils/AppConfig.model");

class AppConfig {
  static async get(key, fallback = null) {
    if (!key) return new Error("Key is required");
    const res = await AppConfigModel.findOne({ key: key });

    if (res) {
      return res.value;
    } else {
      return fallback;
    }
  }

  static async set(key, value) {
    if (!key || !value) return new Error("Key and Value both are required");

    try {
      // Check if a record with the provided key already exists
      const existingRecord = await AppConfigModel.findOne({ key });

      if (existingRecord) {
        // If record exists, update its value
        existingRecord.value = value;
        await existingRecord.save();
        return { [existingRecord.key]: existingRecord.value };
      } else {
        // If record doesn't exist, create a new one
        const newRecord = await new AppConfigModel({ key, value }).save();
        return { [newRecord.key]: newRecord.value };
      }
    } catch (err) {
      return false;
    }
  }
}

module.exports = AppConfig;
