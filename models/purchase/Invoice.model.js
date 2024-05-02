const mongoose = require("mongoose");
const {
  getMongooseFileSchema,
  getMongooseSchema,
} = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  files: [getMongooseFileSchema()],
  invoiceNumber: String,
  invoiceAmount: String,
  purchaseOrderId: String,
  totalAmount: String,
  invoiceApproverDate: {
    type: String,
    default: null,
  },
  invoiceApproverId: {
    type: String,
  },
  invoiceApproverComment: String,
  invoiceApprover: String,
  commentMessege: String,
  invoiceVerifierId: {
    type: String,
    required: true,
  },
  invoiceVerifierComment: String,
  invoiceVerifyDate: {
    type: String,
    default: null,
  },
  invoiceCorrectionId: {
    type: String,
  },
  correctionComment: String,
  invoiceCorrectionDate: {
    type: String,
    default: null,
  },

  paidAmount: String,
  paymentDate: String,
  paymentMode: String,
  messages: [
    new mongoose.Schema({
      id: String,
      user: String,
      userName: String,
      message: String,
      type: String,
      userType: String,
      postedAt: String,
    }),
  ],
});

const model = mongoose.model("purchase_invoice", schema);
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
