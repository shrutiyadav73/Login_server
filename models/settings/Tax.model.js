const mongoose = require("mongoose");
const m2s = require("mongoose-to-swagger");


const taxSchema = new mongoose.Schema({
  id: { type: String, required: true },
  gstEnabled: { type: Boolean, required: true },
  gstNumber: String,
  legalName: String,
  tradeName: String,
  registeredDate: String,
  taxList: [
    {
      id: String,
      name: String,
      rate: String,
      status: {
        type: String,
        default: "inactive",
        enum: ["active", "inactive"],
        required: true,
      },
    },
  ],
  createdOn: { type: Date, default: Date.now(), required: true },
  updatedOn: { type: Date, default: Date.now(), required: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
});

taxSchema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("tax", taxSchema);

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
