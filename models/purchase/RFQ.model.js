const mongoose = require("mongoose");
const { MODEL_DEFAULT_FIELDS } = require("../../configs");
const { getMongooseSchema } = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  prRequestId: String,
  vendorId: String,
  termAndCondition: String,
  predefinedTermsAndCondition: [{ type: String }],
  additionalTermAndCondition: String,
  items: [
    {
      id: String,
      quantity: String,
      total: String,
      ipn: String,
      manufacturer: String,
      mpn: String,
      shortDescription: String,
      unit: String,
    },
  ],
  statusRemark: String,
  action: String,
  pdf: String,
  pdfUrl: String,
  pdfFilePath: String,
});

const model = mongoose.model("purchase_rfq", schema);
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
      "deleted",
      "deletedOn",
      "deletedBy",
    ],
    omitMongooseInternals: false,
  }),
};
