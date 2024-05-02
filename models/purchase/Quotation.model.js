const mongoose = require("mongoose");
const { MODEL_DEFAULT_FIELDS } = require("../../configs");
const { getMongooseFileSchema } = require("../../constant/Mongoose.constant");

const schema = new mongoose.Schema({
  ...MODEL_DEFAULT_FIELDS,
  // Event
  rfqId: String,
  venderQuotationId: {
    type: String,
    required: true,
  },
  quotationDate: {
    type: String,
    required: true,
  },
  quotationValidity: {
    type: String,
    required: true,
  },
  quotationCurrency: {
    type: String,
    required: true,
  },
  quotationFiles: [getMongooseFileSchema()],
  items: [
    {
      ipn: String,
      itemType: String,
      suggestedIpn: String,
      shortDescription: String,
      requestedQty: String,
      quotedQuantity: String,
      partNo: String,
      minimumQuantity: String,
      quotedLeadTime: String,
      quotedUnitPrice: String,
    },
  ],
  paymentTerm: String,
  paymentTermsEvents: [
    {
      event: String,
      amount: String,
    },
  ],
  quotationNumber: String,
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("purchase_quotation", schema);
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
