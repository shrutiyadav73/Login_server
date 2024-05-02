const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const { VendorModel, StatusHistoryModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const Logger = require("../../helpers/Logger.helper");
const { default: mongoose } = require("mongoose");
const ll = "Vendor Controller";

async function list(req, res) {
  const list = await VendorModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any vendor");
}

async function get(req, res) {
  // Verify request contained a vendor id
  if (!req.params.id) {
    return requestFail(res, "Invalid vendor id");
  }

  // Fetch vendor detail form database
  const list = await VendorModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find vendor");
}

async function create(req, res) {
  // Get data and verify as per need
  const FormData = req.getValidatedBody(
    yup.object().shape({
      name: yup.string().required(),
      email: yup.string().required().email(),
      contact: yup.string().required("Contact Number is required"),
      gstNumber: yup.string().when("$exist", {
        is: (exist) => exist,
        then: yup
          .string()
          .trim()
          .matches(
            /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}Z[0-9a-zA-Z]{1}$/,
            "Invalid GST Number"
          ),
      }),
      panNumber: yup.string().when("$exist", {
        is: (exist) => exist,
        then: yup
          .string()
          .trim()
          .matches(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/, "Invalid PAN Number"),
      }),
      currency: yup.string().required("currency is required"),
      personName: yup.string().required("Contact person name is required"),
      personEmail: yup.string().required("Contact person email is required"),
      personContactNumber: yup
        .string()
        .required("Contact person number is required"),
      billing: yup.object({
        address: yup.string().required(),
        city: yup.string().required(),
        state: yup.string().required(),
        stateCode: yup.string(),
        country: yup.string().required(),
        pinCode: yup.string().required(),
      }),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let duplicateVendor = null;

  try {
    duplicateVendor = await VendorModel.findOne({
      $or: [{ name: FormData.name }, { email: FormData.email }],
    });
  } catch (err) {
    Logger.error(ll, `Vendor Duplicate Check Error: ${err.message}`);
  }

  if (duplicateVendor) {
    let message = null;

    if (FormData.name === duplicateVendor.name)
      message = "Vendor name already is use. Enter a unique vendor name.";
    if (FormData.email === duplicateVendor.email)
      message = "Vendor email already is use. Enter a unique vendor email.";

    return requestFail(res, message);
  }

  // generate a unique id for vendor
  const id = `V${generateId(5)}`;

  // add missing detail in the vendor object
  FormData.id = id;
  FormData.status = "active";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  // Now try to create a new vendor
  try {
    await new VendorModel(FormData).save();
    return requestSuccess(res);
  } catch (error) {
    Logger.error(
      ll,
      `Error occurred while creating vendor. Error: ${error.message}`
    );
  }
  return requestFail(
    res,
    "Something unexpected happened. Unable to create vendor"
  );
}

async function update(req, res) {
  // Verify request contained a vendor id
  if (!req.params.id) {
    return requestFail(res, "Invalid vendor id");
  }

  let FormData = req.body;

  FormData.updatedBy = req.user.id;
  delete FormData.id;

  let updateResult = null;

  try {
    updateResult = await VendorModel.updateOne(
      { id: req.params.id, status: { $ne: "deleted" } },
      { $set: FormData }
    );
  } catch (err) {
    Logger.error(ll, `Vendor Update Error: ${err.message}`);
  }

  if (updateResult?.matchedCount) {
    return requestSuccess(res, "Vendor updated successfully");
  } else {
    return requestFail(
      res,
      "Something unexpected happened. Unable to update vendor"
    );
  }
}

async function remove(req, res) {
  // Verify request contained a vendor id
  if (!req.params.id) {
    return requestFail(res, "Invalid vendor id");
  }

  const updateResult = await VendorModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Vendor updated successfully");
  } else {
    return requestFail(res, "Unable to update vendor");
  }
}

async function status(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid id supplied");

  const FormData = req.getValidatedBody(
    yup.object().shape({
      status: yup.string().oneOf(["active", "inactive"]).required(),
    }),
    { stripUnknown: true }
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let vendor = null;

  try {
    vendor = await VendorModel.findOne({
      id: req.params.id,
    });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred, Invalid vendor id. Error: ${err.message}`
    );
  }

  FormData.updatedBy = req.user.id;

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  let updateStatusResult = null;

  try {
    updateStatusResult = await VendorModel.updateOne(
      { id: req.params.id },
      { $set: FormData }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while updating vendor status. Error: ${err.message}`
    );
  }

  if (!updateStatusResult.matchedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unable to update Vendor status");
  }

  let statusHistoryResult = null;

  try {
    statusHistoryResult = await new StatusHistoryModel({
      parentId: req.params.id,
      previous: vendor.status,
      current: FormData.status,
      createdBy: req.user.id,
    }).save({ session });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while creating status history. Error: ${err.message}`
    );
  }

  if (!statusHistoryResult) {
    await session.abortTransaction();
    return requestFail(res, "Unable to update Vendor status");
  }

  await session.commitTransaction();
  await session.endSession();

  return requestSuccess(res, `Vendor status changed to ${FormData.status}`);
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
  status,
};
