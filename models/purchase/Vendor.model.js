const mongoose = require("mongoose");
const {
  getMongooseSchema,
  getAddressSchema,
} = require("../../constant/Mongoose.constant");

const schema = getMongooseSchema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
  currency: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  billing: getAddressSchema(),
  personName: {
    type: String,
    required: true,
  },
  personEmail: {
    type: String,
    required: true,
  },
  personContactNumber: {
    type: String,
    required: true,
  },
});

schema.pre("save", function (next) {
  this.updatedOn = Date.now();
  next();
});

const model = mongoose.model("vendor", schema);
module.exports = {
  model,
  swaggerSchema: m2s(model, {
    /**
     * Whitelist of custom meta fields.
     */
    props: [],
    /**
     * Fields to omit from model root. "__v" and "id" are omitted by default with omitMongooseInternals (default: true)
     */
    omitFields: [
      "_id",
      "__v",
      "createdOn",
      "updatedOn",
      "createdBy",
      "updatedBy",
      "status",
    ],
    /**
     * Omit mongoose internals, omits mongoose internals from result ("__v", "id" - mongoose version field and virtual id field) (default: true)
     */
    omitMongooseInternals: false,
  }),
};
