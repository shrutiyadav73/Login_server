const mongoose = require("mongoose");
const m2s = require("mongoose-to-swagger");

const emailSchema = new mongoose.Schema({
  id: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  default: { type: Boolean },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "deleted", "closed"],
  },

  createdOn: { type: Date, default: Date.now(), required: true },
  updatedOn: { type: Date, default: Date.now(), required: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
});

emailSchema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("email", emailSchema);
exports.default = model;

module.exports = {
  model,
  swaggerSchema: m2s(model, {
    omitFields: [
      "_id",
      "__v",
      "createdOn",
      "updatedOn",
      "createdBy",
      "updatedBy",
    ],
    omitMongooseInternals: false,
  }),
};
