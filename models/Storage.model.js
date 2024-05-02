const mongoose = require("mongoose");
const { generatePassword } = require("../helpers/Common.helper");
const Schema = mongoose.Schema;

const schema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    immutable: true,
    default: generatePassword(40),
  },
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number,
  inUse: {
    type: Boolean,
    default: false,
    required: true,
  },
  linkWith: {
    type: String,
  },
  uploadedOn: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  uploadedBy: {
    type: String,
    required: true,
  },
});

const model = mongoose.model("app_storage", schema);
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
      "uploadedBy",
      "uploadedOn",
    ],
    omitMongooseInternals: false,
  }),
};