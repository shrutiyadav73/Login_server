const mongoose = require("mongoose");


const schema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    immutable: true,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
 
  name: {
    type: String,
    unique: true,
    required: true,
  },
  
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
  createdOn: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  updatedOn: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("subcategory", schema);
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