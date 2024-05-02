const mongoose = require("mongoose");
const { getMongooseSchema } = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    ipnPrefix: {
      type: String,
      immutable: true,
      required: true,
    },
    attribute: [],
  },
  {
    status: {
      type: String,
      default: "inactive",
      enum: ["active", "inactive"],
      required: true,
    },
  }
);

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("category", schema);
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
