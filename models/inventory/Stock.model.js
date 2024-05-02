const mongoose = require("mongoose");
const { MODEL_DEFAULT_FIELDS } = require("../../configs");


const schema = new mongoose.Schema({
  ...MODEL_DEFAULT_FIELDS,
  ipn: {
    type: String,
    required: true,
  },
  warehouseId: {
    type: String,
    required: true,
  },
  warehouse: {
    type: String,
  },
  stock: {
    type: String,
  },
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("stock", schema);
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
      "deletedOn",
      "deletedBy",
      "status",
      "deleted",
      
    ],
    omitMongooseInternals: false,
  }),
};
