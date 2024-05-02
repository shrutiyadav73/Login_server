const mongoose = require("mongoose");
const {
  getMongooseFileSchema,
  getMongooseSchema,
  getMongooseMessageSchema,
} = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  items: [
    {
      id: String,
      quantity: Number,
      ipn: String,
      manufacturerId: String,
      mpn: String,
      shortDescription: String,
      orderedQuantity: {
        type: String,
        default: "0",
      },
      status: String,
      rfq: [{ type: String }],
    },
  ],
  files: [getMongooseFileSchema()],
  indentorId: {
    type: String,
    required: true,
  },
  discount: Number,
  taxes: Number,
  requestSource: String,
  requestSourceDetails: String,
  clientId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  deliverTo: String,
  description: String,
  note: {
    type: String,
    default: "",
  },
  rfq_pending: {
    type: Boolean,
    default: false,
  },
  prApproveComment: String,
  prApprover: String,
  prApproveDate: {
    type: String,
    default: null,
  },
  total: String,
  deliveryDate: String,
  messages: [getMongooseMessageSchema()],
});

schema.pre("updateOne", function (done) {
  this.set("updateOn", Date.now());
  done();
});

const model = mongoose.model("purchase_request", schema);
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
