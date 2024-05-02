const mongoose = require("mongoose");
const {
  getMongooseFileSchema,
  getMongooseSchema,
} = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  ipn: { type: String, required: true, unique: true },
  shortDescription: String,
  description: { type: String },
  categoryId: { type: String, required: true },
  unit: { type: String, required: true },
  subcategoryId: String,
  thumbnails: [getMongooseFileSchema()],
  files: [getMongooseFileSchema()],
  attribute: [
    new mongoose.Schema({
      key: String,
      value: String,
    }),
  ],
  otherAttribute: [
    new mongoose.Schema({
      type: { type: String },
      description: String,
    }),
  ],
  manufacturer: [
    new mongoose.Schema({
      id: String,
      name: String,
      mpn: String,
      datasheet: [getMongooseFileSchema()],
    }),
  ],
  forSale: Boolean,
  forPurchase: Boolean,
  totalAvailableStock: String,
  hsn_sac: { type: String, required: true },
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("item", schema);
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
      "status",
    ],
    omitMongooseInternals: false,
  }),
};
