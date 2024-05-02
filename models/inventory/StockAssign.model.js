const mongoose = require("mongoose");
const { MODEL_DEFAULT_FIELDS } = require("../../configs");


const schema = new mongoose.Schema({
  ...MODEL_DEFAULT_FIELDS,
  ipn: {
    type: String,
  },
  warehouse: {
    type: String,
  },
  warehouseId: {
    type: String,
  },
  assignStock: {
    type: String,
  },
  project: {
    type: String,
  },
  client: {
    type: String,
  },
  assignTo: {
    type: String,
  },

  type: {
    type: String,
  },
  balanceStock: String,
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("stock_assign", schema);
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