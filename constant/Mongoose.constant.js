const { default: mongoose, Schema } = require("mongoose");

const StatusList = [
  "active",
  "inactive",
  "deleted",
  "closed",
  "withdrawal",
  "approved",
  "pending",
  "correction",
  "rejected",
  "po_generated",
  "in_verification",
  "rfq_generated",
  "unknown",
  "invoice_generated",
  "generated",
  "send_to_vendor",
  "quote",
  "quote_receive",
  "paid",
  "in_accounts",
  "receive",
  "cancel",
  "in_correction",
  "in_approval",
  "inspection_pending",
  "inspection_started",
  "inspection_failed",
  "inspection_success",
  "bill_in_accounts",
  "bill_paid",
  "stock_to_inventory",
  "done",
  "po_received",
  "in_progress",
  "inspection_completed",
];

function getMongooseSchema(schema, overrideValues = {}) {
  return new Schema(
    {
      id: {
        type: String,
        unique: true,
        immutable: true,
        required: true,
      },

      ...schema,

      status: {
        type: String,
        default: "active",
        enum: StatusList,
        required: true,
      },
      deleted: {
        type: Boolean,
        default: false,
        required: true,
        select: false,
      },
      deletedOn: {
        type: Date,
        default: Date.now(),
        required: true,
        select: false,
      },
      deletedBy: {
        type: String,
        default: "",
        select: false,
      },
      createdBy: {
        type: String,
        required: true,
      },
      updatedBy: {
        type: String,
        required: true,
      },

      ...overrideValues,
    },
    { timestamps: { createdAt: "createdOn", updatedAt: "updatedOn" } }
  );
}

function getMongooseFileSchema() {
  return new Schema(
    {
      type: { type: String },
      id: {
        type: String,
        required: true,
      },
      preview: {
        type: String,
        required: true,
      },
      name: String,
    },
    { id: false }
  );
}

function getMongooseMessageSchema() {
  return new mongoose.Schema(
    {
      id: String,
      user: String,
      userName: String,
      message: String,
      userType: String,
      postedAt: {
        type: String,
        default: new Date().toString(),
      },
    },
    { id: false }
  );
}

function getAddressSchema(statusCode = false) {
  const addressField = {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    stateCode: String,
    country: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
  };

  if (statusCode)
    addressField.statusCode = {
      type: String,
    };
  return new mongoose.Schema(addressField);
}

module.exports = {
  getMongooseSchema,
  getMongooseFileSchema,
  getMongooseMessageSchema,
  getAddressSchema,
};
