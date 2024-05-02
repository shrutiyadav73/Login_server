const ENVIRONMENT_VARIABLES = require("./env");
const MODEL_STATUS_LIST = [
  "active",
  "inactive",
  "deleted",
  "closed",
  "approved",
  "pending",
  "rejected",
  "invoice_generated",
  "generated",
  "send_to_vendor",
  "quote",
  "quote_receive",
  "receive",
  "cancel",
  "generated",
  "in_verification",
  "in_correction",
  "in_approval",
  "purchase_initiated",
];

const MODEL_DEFAULT_FIELDS = {
  id: {
    type: String,
    unique: true,
    immutable: true,
    required: true,
  },
  status: {
    type: String,
    default: "active",
    enum: MODEL_STATUS_LIST,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
    required: true,
    select: false
  },
  deletedOn: {
    type: Date,
    default: Date.now(),
    required: true,
    select: false
  },
  deletedBy: {
    type: String,
    default: "",
    select: false
  },
  createdOn: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  updatedOn: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: true,
  },
};

const MONGO_DB_URL =
  process.env.MONGO_DB_URL ??
  (process.env.APP_ENVIRONMENT == "production"
    ? `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_SERVER_CLUSTER}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
    : `mongodb://localhost:27017/${
        process.env.MONGO_DB_NAME || "local_template_db"
      }`);

module.exports = {
  ...ENVIRONMENT_VARIABLES,
  MODEL_DEFAULT_FIELDS,
  MODEL_STATUS_LIST,
  MONGO_DB_URL,
};
