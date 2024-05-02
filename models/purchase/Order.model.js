const mongoose = require("mongoose");
const { getMongooseSchema } = require("../../constant/Mongoose.constant");
const Schema = mongoose.Schema;

const schema = getMongooseSchema({
  prId: {
    type: String,
    required: true,
  },
  quotationId: {
    type: String,
    required: true,
  },
  vendorId: {
    type: String,
    required: true,
  },
  voucherNumber: {
    type: String,
    required: true,
  },
  dispatchThrough: {
    type: String,
  },
  destination: {
    type: String,
  },
  portOfLoading: {
    type: String,
  },
  portOfDischarge: {
    type: String,
  },
  voucher_date: {
    type: Date,
  },
  paymentMode: {
    type: String,
  },
  termsAndConditionIds: [String],
  additionalTermsAndCondition: {
    type: String,
  },

  items: [
    new Schema({
      ipn: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      quantity: {
        type: String,
        required: true,
      },
      invertedQuantity: {
        type: String,
      },
      rate: {
        type: String,
      },
      total: {
        type: String,
        required: true,
      },
      ref: {
        type: String,
      },
    }),
  ],

  total: String,

  poApproverId: {
    type: String,
  },
  poApproverComment: String,
  poApproveDate: {
    type: String,
    default: null,
  },

  poCorrectionId: {
    type: String,
  },
  correctionComment: String,
  poCorrectionDate: {
    type: String,
    default: null,
  },

  poVerifierId: {
    type: String,
    required: true,
  },
  poVerifierComment: String,
  poVerifyDate: {
    type: String,
    default: null,
  },
  messages: [
    new Schema({
      id: String,
      user: String,
      userName: String,
      message: String,
      type: String,
      userType: String,
      postedAt: String,
    }),
  ],
  poDocument: {
    type: Object,
    default: {},
  },
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("purchase_order", schema);
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
