const mongoose = require("mongoose");
const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");

const {
  RequestModel,
  StatusHistoryModel,
  MessageModel,
} = require("../../models");

const {
  generateId,
  getAdmin,
  paramProxy,
  generatePassword,
  generateNextSerialId,
  appendItemInArrayList,
  generateRandomString,
} = require("../../helpers/Common.helper");

const pipeline = require("../../database/pipelines/purchase/Request.pipeline");
const { linkFiles, unlinkAllFiles } = require("../Storage.controller");
const Logger = require("../../helpers/Logger.helper");
const ll = "Purchase|RequestController";

const {
  PR_CREATED,
  PR_CORRECTION_SAVED,
} = require("../../constant/Event.constant");

const ACTION_TO_STATUS = {
  approved: "approved",
  verified: "in_approval",
  correction: "in_correction",
  rejected: "rejected",
};

async function list(req, res) {
  const { query } = req;

  if (query.listType) {
    if (query.listType === "correction")
      return getList(req, res, {
        status: "in_correction",
        createdBy: req.user.id,
      });

    if (query.listType === "approval")
      return getList(req, res, {
        status: "in_approval",
        prApprover: req.user.id,
      });

    // In listType => pending_rfq_generation: will get the request which has rfq_generation pending
    if (query.listType === "pending_rfq_generation") {
      let list = await getList(req, res, {
        status: "approved",
        rfq_pending: true,
      });

      if (!list && list?.length === 0) {
      }

      list = list?.filter((pr) => {
        let isGenerated = true;
        pr?.items?.forEach((item) => {
          isGenerated = item.status != "rfq_generated" && isGenerated;
        });
        return isGenerated;
      });

      if (list) return requestSuccess(res, list);

      return requestFail(res, "Not found");
    }
  }

  // Get all the item available in purchase request
  return getList(req, res, query);
}

async function getList(req, res, query = {}) {
  const list = await RequestModel.aggregate(pipeline({ ...query }));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Not found.");
}

async function get(req, res) {
  const query = await paramProxy(req.query);

  // Verify request contained a project id
  if (!req.params.id) {
    return requestFail(res, "Invalid project id");
  }

  // Fetch project detail form database
  const list = await RequestModel.aggregate(
    pipeline({ id: req.params.id, ...query })
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list && list.length > 0) {
    return requestSuccess(res, list[0]);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find project");
}

async function create(req, res) {
  // Step 1: Define variables and validate request data and store in FromData
  //-------------------------------------------------------------------------
  const FormData = req.getValidatedBody(
    yup.object().shape({
      indentorId: yup.string().required(),
      requestSource: yup.string().required(),
      prApprover: yup.string().required(),
      deliverTo: yup.string().required(),
      deliveryDate: yup.string().required(),
      projectId: yup.string().required(),
      clientId: yup.string().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            ipn: yup.string().required(),
            manufacturer: yup.string().required(),
            quantity: yup.string().required(),
          })
        )
        .min(1, "Minimum one component is required"),
    })
  );
  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  // Remove unwanted fields
  delete FormData.clientName;
  delete FormData.projectName;

  // generate a unique id for request
  const id = await generateNextSerialId(RequestModel, "PRN");

  // Add missing detail in the request object
  FormData.id = id;
  FormData.status = "in_approval";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  Logger.debug(ll, `Form Data: ${JSON.stringify(FormData)}`);

  // Create database transactions
  const session = await mongoose.connection.startSession();
  session.startTransaction();

  // Step 2: Store Purchase Request in Database
  //-------------------------------------------------------------------------

  let createPurchaseRequestResult = null;

  try {
    createPurchaseRequestResult = await new RequestModel(FormData).save({
      session,
    });
  } catch (err) {
    Logger.error(ll, `PR Create Error: ${err.message}`);
  }

  if (!createPurchaseRequestResult) {
    await session.abortTransaction();
    return requestFail(
      res,
      "Unexpected error occurred. Unable to create Purchase Request"
    );
  }

  // Step 3: Link files with Purchase Request, if Purchase Request has documents
  //-------------------------------------------------------------------------

  if (createPurchaseRequestResult?.files?.length) {
    let linkFileResult = null;
    try {
      linkFileResult = await linkFiles(
        createPurchaseRequestResult.id,
        createPurchaseRequestResult.files ?? [],
        { session }
      );
    } catch (error) {
      Logger.error(ll, `Link File Error Occurred, Error: ${error.message}`);
    }

    if (!linkFileResult) {
      await session.abortTransaction();
      return requestFail(
        res,
        "Unexpected error occurred. Unable to create Purchase Request"
      );
    }
  }

  // Step 4: Save the status history of Purchase Request
  //-------------------------------------------------------------------------

  let statusHistoryResult = null;
  try {
    statusHistoryResult = await new StatusHistoryModel({
      parentId: id,
      previous: "null",
      current: "pending",
      createdBy: req.user.id,
    }).save({ session });
  } catch (error) {
    Logger.error(ll, `Status History Error: ${error.message}`);
  }

  if (!statusHistoryResult) {
    await session.abortTransaction();
    return requestFail(
      res,
      "Unexpected error occurred. Unable to create Purchase Request"
    );
  }

  await session.commitTransaction();
  await session.endSession();

  EventBus.emit(PR_CREATED, createPurchaseRequestResult);

  requestSuccess(res, "Purchase request created successfully");
}

async function update(req, res) {
  if (req.query.mode === "approval") return approval(req, res);

  if (!req.params.id) return requestFail(res, "Invalid request id");

  // store all request data into request var
  const FormData = req.body;
  FormData.updatedBy = req.user.id;

  Logger.debug(ll, JSON.stringify(FormData));

  // Get Purchase request
  let PurchaseRequest = null;
  try {
    PurchaseRequest = await RequestModel.findOne({ id: req.params.id });
  } catch (error) {
    Logger.error(ll, error);
    return requestFail(res, "Invalid Purchase Request id.");
  }

  if (!PurchaseRequest) return requestFail(res, "Invalid Purchase Request id.");

  // FormData.messages = appendItemInArrayList(PurchaseRequest.messages ?? [], {
  //   id: generatePassword(17),
  //   user: req.user.id,
  //   userName: req.user.name,
  //   message: FormData.message,
  //   userType: "creator",
  // });

  delete FormData.id;
  FormData.status = "in_approval";

  const updateResult = await RequestModel.updateOne(
    { id: req.params.id },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    if (FormData.files) {
      await unlinkAllFiles(req.params.id);
      await linkFiles(req.params.id, FormData.files);
    }

    if (PurchaseRequest.status !== FormData.status)
      await StatusHistoryModel.create({
        parentId: PurchaseRequest.id,
        previous: PurchaseRequest.status,
        current: FormData.status,
        createdBy: req.user.id,
      });

    return requestSuccess(res, "Purchase request updated successfully");
  } else {
    Logger.error(ll, error);
    return requestFail(res, "Unable to update Purchase request");
  }
}

async function remove(req, res) {
  // Verify request contained a request id
  if (!req.params.id) {
    return requestFail(res, "Invalid request id");
  }

  let ADMIN = await getAdmin();

  try {
    await RequestModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "request deleted successfully");
  } catch (error) {
    return requestFail(res, "Can't delete request now");
  }
}

async function withdraw(req, res) {
  // Verify request contained a request id
  if (!req.params.id) {
    return requestFail(res, "Invalid request id");
  }

  let ADMIN = await getAdmin();

  try {
    await RequestModel.updateOne(
      { id: req.params.id },
      { $set: { status: "withdrawal", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "request withdrawal successfully");
  } catch (error) {
    return requestFail(res, "Can't withdraw request now");
  }
}

async function changeStatus(req, res) {
  if (!req.params.id || !req.params.status) return requestFail(res);

  // store all request data into request var
  const FormData = req.body;
  FormData.updatedBy = req.user.id;

  // get pr request from database
  let PurchaseRequest = null;

  try {
    PurchaseRequest = await RequestModel.findOne({ id: req.params.id });
  } catch (error) {}

  if (!PurchaseRequest) return requestFail(res);

  FormData.status = FormData?.status?.toLowerCase()
    ? FormData?.status?.toLowerCase()
    : "unknown";

  FormData.prApproveDate = new Date().toString();
  FormData.prApproveComment = FormData.comment;
  FormData.messages = appendItemInArrayList(PurchaseRequest.messages, {
    id: generatePassword(17),
    user: req.user.id,
    userName: req.user.name,
    userType: "approver",
    message: FormData.comment,
  });

  const updateResult = await RequestModel.updateOne(
    { id: req.params.id },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    if (PurchaseRequest.status !== FormData.status)
      await StatusHistoryModel.create({
        parentId: PurchaseRequest.id,
        previous: PurchaseRequest.status,
        current: FormData.status,
        createdBy: req.user.id,
      });

    return requestSuccess(res, "Purchase request updated successfully");
  } else {
    Logger.error(ll, error);
    return requestFail(res, "Unable to update purchase request");
  }
}

async function approve(req, res) {
  // Step 1: Prepare variables, Validate Request and important fields
  // ----------------------------------------------------------------
  const ACTION_TO_MESSAGE = {
    approved: "Purchase request approved successfully",
    correction: "Purchase request send to creator for correction",
    rejected: "Purchase request has been rejected",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      action: yup
        .string()
        .oneOf(["approved", "correction", "rejected"])
        .required(),
      message: yup.string().required(),
    }),
    { stripUnknown: true }
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  if (!req.params.id) return requestFail(res, "Invalid id supplied");

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  // Step 2: Generate message payload and create one
  // -----------------------------------------------
  let message = {
    id: generateRandomString(28),
    userId: req.user.id,
    message: FormData.message,
    entity: req.params.id,
    meta: {
      userType: "approver",
    },
  };

  // Store Message into database
  let messageResult = null;

  try {
    messageResult = await MessageModel.create([message], { session });
  } catch (error) {
    Logger.error(
      ll,
      `Error occurred while store message in pr, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Step 3: Update PR details
  // -------------------------------------------------------------

  // Update PO status as per verifier action
  let prUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
    prApproverComment: FormData.message,
    prApproveDate: new Date().toString(),
    rfq_pending: true,
  };

  let prUpdateResult = null;

  try {
    prUpdateResult = await RequestModel.updateOne(
      { id: req.params.id },
      { $set: prUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in pr, Error: ${err.message}`
    );
  }

  if (!prUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}

async function correction(req, res) {
  // Step 1: Check params have purchase request id
  if (!req.params.id) return requestFail(res, "Invalid request, Id is missing");

  // Step 2:
  const FormData = req.getValidatedBody(
    yup.object().shape({
      indentorId: yup.string().required(),
      requestSource: yup.string().required(),
      prApprover: yup.string().required(),
      deliverTo: yup.string().required(),
      deliveryDate: yup.string().required(),
      projectId: yup.string().required(),
      clientId: yup.string().required(),
      message: yup.string().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            ipn: yup.string().required(),
            manufacturer: yup.string().required(),
            quantity: yup.string().required(),
          })
        )
        .min(1, "Minimum one component is required"),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  FormData.updatedBy = req.user.id;
  FormData.status = "in_approval";
  delete FormData.id;

  // Starting mongo db session

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  // Step 3: Generate message payload and create one
  // -----------------------------------------------
  let message = {
    id: generateRandomString(28),
    userId: req.user.id,
    message: FormData.message,
    entity: req.params.id,
    meta: {
      userType: "creator",
    },
  };

  // Store Message into database
  let messageResult = null;

  try {
    messageResult = await new MessageModel(message).save({ session });
  } catch (error) {
    Logger.error(
      ll,
      `Error occurred while store message in pr, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  //

  let updatePurchaseRequestResult = null;
  try {
    updatePurchaseRequestResult = await RequestModel.updateOne(
      { id: req.params.id },
      { $set: { ...FormData } }
    );
  } catch (err) {
    Logger.error(ll, `PR Correction Error: ${err.message}`);
  }

  if (
    !updatePurchaseRequestResult ||
    updatePurchaseRequestResult.modifiedCount !== 1
  ) {
    await session.abortTransaction();
    return requestFail(
      res,
      `Unexpected error occurred, Unable to save changes`
    );
  }

  await session.commitTransaction();
  await session.endSession();

  EventBus.emit(PR_CORRECTION_SAVED, FormData);

  return requestSuccess(
    res,
    `PR changes has been saved and moved for approval`
  );
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
  withdraw,
  changeStatus,
  correction,
  approve,
};
