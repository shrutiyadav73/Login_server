const mongoose = require("mongoose");
const m2s = require("mongoose-to-swagger");


const policySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true ,unique: true},
  description: { type: String, required: true },
  effectiveDate: { type: String, required: true},
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive", "deleted", "closed"],
    required: true,
  },

  createdOn: { type: Date, default: Date.now(), required: true },
  updatedOn: { type: Date, default: Date.now(), required: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
});

policySchema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("policy", policySchema);
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
