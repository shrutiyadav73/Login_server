const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    immutable: true,
    required: true,
  },
  clientId: {
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
    default: "active",
    enum: [
      "active",
      "inactive",
      "deleted",
      "closed",
      "pending",
      "approved",
      "rejected",
    ],
    required: true,
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

const model = mongoose.model("project", schema);
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