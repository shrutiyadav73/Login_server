const mongoose = require("mongoose");
const { MODEL_DEFAULT_FIELDS } = require("../../configs");
const { getMongooseSchema } = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  poId: {
    type: String,
    required: true,
  },
  purchaseReceiveId: {
    type: String,
    required: true,
  },
  totalQty: {
    type: String,
    default: 0,
  },
  receivedQty: {
    type: String,
    default: 0,
  },
  acceptedQty: {
    type: String,
    default: 0,
  },
  rejectedQty: {
    type: String,
    default: 0,
  },
  items: [
    {
      id: String,
      ipn: String,
      shortDescription: String,
      expectedQty: {
        type: String,
        default: 0,
      },
      acceptedQty: {
        type: String,
        default: 0,
      },
      rejectedQty: {
        type: String,
        default: 0,
      },
      receivedQty: {
        type: String,
        default: 0,
      },
    },
  ],
});

const model = mongoose.model("igi", schema);
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
