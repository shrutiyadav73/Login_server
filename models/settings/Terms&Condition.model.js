const mongoose = require("mongoose");
const { MODEL_DEFAULT_FIELDS } = require("../../configs");
const m2s = require("mongoose-to-swagger");


const TermsAndConditionSchema = new mongoose.Schema({
 
  ...MODEL_DEFAULT_FIELDS,
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  scope: {
    type:Array,
    default:[]
  },
});

TermsAndConditionSchema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("settings_terms_and_conditions", TermsAndConditionSchema);
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
      "id",
      "status",
      "deleted",
      "deletedOn",
      "deletedBy",
    ],
    omitMongooseInternals: false,
  }),
};