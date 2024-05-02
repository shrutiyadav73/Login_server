const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const { ReceiveModel, StatusHistoryModel } = require("../../models");

const mongoose = require("mongoose");
const {
  paramProxy,
  generateNextSerialId,
} = require("../../helpers/Common.helper");
const pipeline = require("../../database/pipelines/purchase/Receive.pipeline");
const { linkFiles, unlinkAllFiles } = require("../Storage.controller");
const Logger = require("../../helpers/Logger.helper");
const ll = "PurchaseReceiveController";
const {
  PURCHASE_RECEIVE_CREATED,
  PURCHASE_RECEIVE_ACTION,
} = require("../../constant/Event.constant");

async function list(req, res) {
  const query = await paramProxy(req.query);
  const list = await ReceiveModel.aggregate(pipeline({ ...query }));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Nothing found");
}

async function get(req, res) {
  const query = await paramProxy(req.query);

  // Verify request contained a receive id
  if (!req.params.id) {
    return requestFail(res, "Invalid receive id");
  }

  // Fetch receive detail form database
  const list = await ReceiveModel.aggregate(
    pipeline({ id: req.params.id, ...query })
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list && list.length > 0) {
    return requestSuccess(res, list[0]);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find receive");
}

async function create(req, res) {
  const FormData = req.body;

  // Add basic required details such as status and etc.
  FormData.id = await generateNextSerialId(ReceiveModel, "PRE");
  FormData.status = "po_received";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  try {
    const result = await new ReceiveModel(FormData).save();

    await linkFiles(FormData.id, result.poDocuments);
    await linkFiles(FormData.id, result.poInvoices);

    EventBus.emit(PURCHASE_RECEIVE_CREATED, result);
    return requestSuccess(res, "Purchase Receive created successfully");
  } catch (error) {
    Logger.error(ll, error);
    return requestFail(res, "Unable to create purchase receive");
  }
}

async function update(req, res) {
  // Verify request contained a receive id
  if (!req.params.id) {
    return requestFail(res, "Invalid receive id");
  }

  const FormData = req.body;

  FormData.updatedBy = req.user.id;

  delete FormData.id;

  const updateResult = await ReceiveModel.updateOne(
    { id: req.params.id },
    { $set: { ...FormData } }
  );

  if (updateResult.matchedCount) {
    await unlinkAllFiles(req.params.id);
    await linkFiles(req.params.id, FormData.poInvoices);
    await linkFiles(req.params.id, FormData.poDocuments);

    return requestSuccess(res);
  } else {
    return requestFail(res, "Unable to update purchase receive");
  }
}

async function remove(req, res) {
  // Verify request contained a receive id
  if (!req.params.id) {
    return requestFail(res, "Invalid receive id");
  }

  try {
    await ReceiveModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: req.user.id } }
    );
    return requestSuccess(res, "receive deleted successfully");
  } catch (error) {
    return requestFail(res, "Can't delete receive now");
  }
}

async function status(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid purchase receive id");

  const FormData = {
    status: req.body.status ?? null,
    reason: req.body.reason ?? "",
  };
  FormData.updatedBy = req.user.id;

  if (!FormData.status)
    return requestFail(res, "Invalid purchase receive status");

  const dbPurchaseReceive = await ReceiveModel.findOne({ id: req.params.id });

  if (!dbPurchaseReceive)
    return requestFail(
      res,
      "Unable to update status, Invalid purchase receive"
    );

  const updateResult = await ReceiveModel.updateOne(
    { id: req.params.id },
    { $set: FormData }
  );
  if (updateResult.matchedCount) {
    await StatusHistoryModel.create({
      parentId: req.params.id,
      previous: dbPurchaseReceive.status,
      current: FormData.status,
      createdBy: req.user.id,
    });

    return requestSuccess(res, "Purchase receive status updated successfully");
  } else {
    return requestFail(res, "Unable to update purchase receive status");
  }
}

async function action(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid id supplied");

  const ACTION_TO_STATUS = {
    send_to_igi: "send_to_igi",
  };

  const ACTION_TO_MESSAGE = {
    send_to_igi: "Receive status updated, send to igi",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      action: yup.string().required("Action is required"),
    }),
    { stripUnknown: true }
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let PurchaseReceive = null;

  try {
    PurchaseReceive = await ReceiveModel.findOne({ id: req.params.id });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while get receive by id. Error: ${err.message}`
    );
  }

  if (!PurchaseReceive) return requestFail(res, "Invalid Purchase Receive id.");

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  // Step 2: Generate Status History
  // -----------------------------------------------
  let statusHistoryResult = null;
  try {
    statusHistoryResult = await new StatusHistoryModel({
      parentId: PurchaseReceive.id,
      previous: PurchaseReceive.status,
      current: ACTION_TO_STATUS[FormData.action],
      createdBy: req.user.id,
    }).save({ session });
  } catch (error) {
    Logger.error(ll, `Status History Error: ${error.message}`);
  }
  if (!statusHistoryResult) {
    await session.abortTransaction();
    return requestFail(
      res,
      "Unexpected error occurred. Unable to create Receive"
    );
  }

  // Step 3: Update Receive details
  // -------------------------------------------------------------

  // Update RFQ status as per user action
  let receiveUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
  };

  // Save change to database
  let receiveUpdateResult = null;
  try {
    receiveUpdateResult = await ReceiveModel.updateOne(
      { id: req.params.id },
      { $set: receiveUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in Receive, Error: ${err.message}`
    );
  }

  // Is able to save change in database
  if (!receiveUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  EventBus.emit(
    PURCHASE_RECEIVE_ACTION,
    await ReceiveModel.findOne({ id: req.params.id })
  );

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
  status,
  action,
};
