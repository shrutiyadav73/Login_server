const mongoose = require("mongoose");
const {
  getMongooseFileSchema,
  getMongooseSchema,
} = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  purchaseOrderId: {
    type: String,
    required: true,
  },
  items: [
    {
      id: String,
      ipn: {
        type: String,
      },
      quantity: Number,
      shortDescription: {
        type: String,
      },
      basePrice: {
        type: String,
      },
      gst: {
        type: String,
      },
      hsn_sac: {
        type: String,
      },
      customDuty: {
        type: String,
      },
      frightCharges: {
        type: String,
      },
    },
  ],
  otherCharges: {
    type: String,
  },
  itemsTotal: {
    type: String,
  },
  taxInvoiceNumber: {
    type: String,
  },
  taxInvoiceDate: {
    type: String,
  },
  taxSubtotal: {
    type: String,
  },
  taxGst: {
    type: String,
  },
  taxTotal: {
    type: String,
  },
  poDocuments: [getMongooseFileSchema()],
  poInvoices: [getMongooseFileSchema()],
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("purchase_receive", schema);
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
