const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const { TermsAndConditionModel, StatusHistoryModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const { default: mongoose } = require("mongoose");
const Logger = require("../../helpers/Logger.helper");
const ll = "Client Controller";

async function list(req, res) {
  const list = await TermsAndConditionModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any termsAndCondition");
}

async function get(req, res) {
  // Verify request containe a termsAndCondition id
  if (!req.params.id) {
    return requestFail(res, "Invalid termsAndCondition id");
  }

  // Fetch termsAndCondition detail form database
  const list = await TermsAndConditionModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find termsAndCondition");
}

async function create(req, res) {
  // get current user
  let ADMIN = await getAdmin();

  // Get data and verify as per need
  let termsAndCondition = req.body;

  if (!termsAndCondition.name) {
    return requestFail(res, "TermsAndCondition name is required");
  }

  if (await TermsAndConditionModel.findOne({ name: termsAndCondition.name })) {
    return requestFail(res, "Duplicate TermsAndCondition name");
  }

  // generate a unique id for termsAndCondition
  const id = `T&C${generateId(5)}`;

  // add missing detail in the termsAndCondition object
  termsAndCondition.id = id;
  termsAndCondition.status = termsAndCondition.default ? "active" : "inactive";
  termsAndCondition.createdBy = ADMIN.id;
  termsAndCondition.updatedBy = ADMIN.id;

  // Now try to create a new termsAndCondition
  try {
    await new TermsAndConditionModel(termsAndCondition).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(
    res,
    "Something went wrong, Can't create termsAndCondition now."
  );
}

async function update(req, res) {
  if (!req.params.id) {
    return requestFail(res, "Invalid termsAndCondition id");
  }

  let FormData = req.body;

  FormData.updatedBy = req.user.id;
  delete FormData.id;

  // find termsAndCondition as per name
  let dbRecord = await TermsAndConditionModel.findOne({
    name: FormData.name,
  });

  if (dbRecord && dbRecord.id != req.params.id)
    return requestFail(res, "termsAndCondition already in use");

  const updateResult = await TermsAndConditionModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "termsAndCondition updated successfully");
  } else {
    return requestFail(res, "Unable to update termsAndCondition");
  }
}

async function remove(req, res) {
  if (!req.params.id) {
    return requestFail(res, "Invalid termsAndCondition id");
  }

  const updateResult = await TermsAndConditionModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "termsAndCondition deleted successfully");
  } else {
    return requestFail(res, "Unable to delete termsAndCondition");
  }
}

async function updateStatus(req, res) {
  // Step 1: Prepare variables, Validate Request and important fields
  // ----------------------------------------------------------------
  const ACTION_TO_MESSAGE = {
    active:
      "Terms & Condition's status has been changed. Terms & Condition's is active now.",
    inactive:
      "Terms & Condition's status has been changed. Terms & Condition's is inactive now.",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      status: yup.string().oneOf(["active", "inactive"]).required(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  FormData.updatedBy = req.user.id;

  let dbRecord = null;

  try {
    dbRecord = await TermsAndConditionModel.findOne({ id: req.params.id });
  } catch (error) {
    Logger.error(ll, `TnC not found error: ${err.message}`);
  }

  if (!dbRecord) return requestFail(res);

  let createTnCStatusHistory = null;

  try {
    createTnCStatusHistory = await new StatusHistoryModel({
      parentId: req.params.id,
      previous: dbRecord.status,
      current: FormData.status,
      createdBy: req.user.id,
    }).save({ session });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while creating status history. Error: ${err.message}`
    );
  }

  if (!createTnCStatusHistory) {
    await session.abortTransaction();
    await session.endSession();
    return requestFail(
      res,
      "Something went wrong. Failed to change TnC status."
    );
  }

  let TnCStatusUpdateResult = null;

  try {
    TnCStatusUpdateResult = await TermsAndConditionModel.updateOne(
      { id: req.params.id },
      { $set: FormData }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while updating the TnC status. Error: ${err.message}`
    );
  }

  if (TnCStatusUpdateResult.modifiedCount) {
    await session.commitTransaction();
    await session.endSession();
    return requestSuccess(res, ACTION_TO_MESSAGE[FormData.status]);
  }

  await session.abortTransaction();
  await session.endSession();

  return requestFail(res, "Something went wrong. Failed to change TnC status.");
}

module.exports = {
  list,
  get,
  create,
  update,
  updateStatus,
  delete: remove,
};
