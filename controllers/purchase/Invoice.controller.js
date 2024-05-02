const {
  requestSuccess,
  requestFail,
  requestFailWithError,
  reqFail,
} = require("../../helpers/RequestResponse.helper");
const { InvoiceModel,  MessageModel } = require("../../models");
const { linkFiles, unlinkAllFiles } = require("../Storage.controller");

const {
  generateId,
  getAdmin,
  paramProxy,
  generateNextSerialId,
  generatePassword,
  generateRandomString,
} = require("../../helpers/Common.helper");

const {
  POList: pipeline,
} = require("../../database/pipelines/purchase/Invoice.pipeline");
const {
  PI_CREATED,
  PI_VERIFIED,
  PI_APPROVED,
} = require("../../constant/Event.constant");
const Logger = require("../../helpers/Logger.helper");
const ll = "Purchase Invoice Controller";
const { default: mongoose } = require("mongoose");



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
    if (query.listType === "verification")
      return getList(req, res, {
        status: "in_verification",
        invoiceVerifierId: req.user.id,
      });
    if (query.listType === "approval")
      return getList(req, res, {
        status: "in_approval",
        invoiceApproverId: req.user.id,
      });
  }

  return getList(req, res,query);

 
}

async function getList(req, res, query = {}) {
  const list = await InvoiceModel.aggregate(
    pipeline({ ...query })
  );

  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Not found.");
}

async function get(req, res) {
  const query = await paramProxy(req.query);

  // Verify request contained a invoice id
  if (!req.params.id) {
    return requestFail(res, "Invalid invoice id");
  }

  // Fetch invoice detail form database
  const list = await InvoiceModel.aggregate(
    pipeline({ id: req.params.id, ...query })
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list && list.length > 0) {
    return requestSuccess(res, list[0]);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find invoice");
}

async function create(req, res) {
  // Get data and verify as per need
  let FormData = req.body;

  // generate a unique id for invoice
  const id = await generateNextSerialId(InvoiceModel, "PI");

  // add missing detail in the invoice object

  FormData.id = id;
  FormData.status = "in_verification";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  // Now try to create a new invoice
  try {
    const InvoiceResult = await new InvoiceModel(FormData).save();
    await linkFiles(InvoiceResult.id, InvoiceResult.files);
    EventBus.emit(PI_CREATED, InvoiceResult);
    InvoiceModel.updateOne(
      { id: FormData.purchaseOrderId },
      { $set: { status: "invoice_generated" } },

      (error, result) => {
        if (!error) {
          return requestSuccess(res);
        } else {
          return requestFail(
            res,
            "Something went wrong, Can't create invoice now"
          );
        }
      }
    );
  } catch (error) {
    print(error);
  }
}

async function update(req, res) {
  // Verify request contained a invoice id
  if (!req.params.id) {
    return requestFail(res, "Invalid invoice id");
  }

  const FormData = req.body;

  FormData.updatedBy = req.user.id;

  if (FormData.comment) {
    let tempPurchaseInvoice = null;

    try {
      tempPurchaseInvoice = await InvoiceModel.findOne({
        id: req.params.id,
      });
    } catch (error) {}

    if (!tempPurchaseInvoice)
      return requestFail(res, "Something went wrong, Purchase Order missing");

    let tempMessageList = tempPurchaseInvoice.messages;

    if (!Array.isArray(tempMessageList)) {
      tempMessageList = [];
    }

    tempMessageList.push({
      id: generatePassword(17),
      user: req.user.id,
      userName: req.user.name,
      message: FormData.comment,
      type: "correction",
      userType: FormData.userType,
      postedAt: new Date().toString(),
    });

    FormData.messages = tempMessageList;
  }

  delete FormData.id;

  const updateResult = await InvoiceModel.updateOne(
    { id: req.params.id },
    { $set: { ...FormData } }
  );

  if (updateResult.matchedCount) {
    await unlinkAllFiles(req.params.id);
    await linkFiles(req.params.id, FormData.files);

    return requestSuccess(res);
  } else {
    return requestFail(res, "Unable to update purchase receive");
  }
}
async function verify(req, res) {
  const ACTION_TO_MESSAGE = {
    verified: "Purchase invoice verified successfully",
    correction: "Purchase invoice send to creator for correction",
    rejected: "Purchase invoice has been rejected",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      action: yup
        .string()
        .oneOf(["verified", "correction", "rejected"])
        .required(),
      message: yup.string().required(),
      invoiceApproverId: yup.string(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  if (!req.params.id) return requestFail(res, "Invalid id supplied");

  let message = {
    id: generateRandomString(28),
    userId: req.user.id,
    message: FormData.message,
    entity: req.params.id,
    meta: {
      userType: "verifier",
    },
  };

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  // Store Message into database
  let messageResult = null;
  try {
    messageResult = await MessageModel.create([message], { session });
  } catch (error) {
    Logger.error(
      ll,
      `Error occurred while store message in pi, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }


  // Update PI status as per verifier action


  let piUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
    invoiceVerifierComment: FormData.message,
    invoiceVerifyDate: new Date().toString(),
  };

  if (FormData.action === "verified")
    piUpdateFields.invoiceApproverId = FormData.invoiceApproverId;

  let piUpdateResult = null;
  try {
    piUpdateResult = await InvoiceModel.updateOne(
      { id: req.params.id },
      { $set: piUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in pi, Error: ${error.message}`
    );
  }

  if (!piUpdateResult.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  await session.commitTransaction();
  session.endSession();

  // Dispatch Event
  EventBus.emit(
    PI_VERIFIED,
    await InvoiceModel.find({ id: req.params.id })
  );

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}

async function correction(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid request, Id is missing");

  // store all request data into invoice var
  const FormData = req.body;

  FormData.updatedBy = req.user.id;
  FormData.status = "in_verification";

  if (FormData.comment) {
    let tempPurchaseInvoice = null;

    // Try to get purchase invoice from Database
    try {
      tempPurchaseInvoice = await InvoiceModel.findOne({
        id: req.params.id,
      });
    } catch (error) {
      // Empty
    }

    if (!tempPurchaseInvoice)
      return requestFail(res, "Something went wrong, Purchase Invoice missing");

    let tempMessageList = tempPurchaseInvoice.messages;

    if (!Array.isArray(tempMessageList)) {
      tempMessageList = [];
    }

    tempMessageList.push({
      id: generatePassword(17),
      user: req.user.id,
      userName: req.user.name,
      message: FormData.comment,
      type: "correction",
      userType: "creator",
      postedAt: new Date().toString(),
    });

    FormData.messages = tempMessageList;
  }

  // Removing id form FormData because don't need to update purchase invoice id
  delete FormData.id;

  InvoiceModel.updateOne(
    { id: req.params.id },
    { $set: { ...FormData } },
    (error, result) => {
      print(error);
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(
          res,
          "Something went wrong, Can't save the corrections"
        );
      }
    }
  );
}

async function cancel(req, res) {
  // Verify request contained a invoice id
  if (!req.params.id) {
    return requestFail(res, "Invalid invoice id");
  }

  let ADMIN = await getAdmin();

  try {
    await InvoiceModel.updateOne(
      { id: req.params.id },
      { $set: { status: "cancelled", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "Invoice cancelled successfully");
  } catch (error) {
    return requestFail(res, "Can't cancel invoice now");
  }
}

async function changeStatus(req, res) {
  if (!req.params.id || !req.params.status) return requestFail(res);

  // store all request data into invoice var
  let formData = req.body,
    currentUser = await getAdmin();

  if (!currentUser) return requestFail(res, "Unauthorized request");

  // update entry who is updating the field
  formData.updatedBy = currentUser.id;

  // get pr request from database
  let tempINObj = null;

  try {
    tempINObj = await InvoiceModel.findOne({ id: req.params.id });
  } catch (error) {}

  if (!tempINObj)  return requestFail(res);

  let tempMessageList = tempINObj.messages ?? [];

  if (!Array.isArray(tempMessageList)) {
    tempMessageList = [];
  }

  tempMessageList.push({
    id: generatePassword(17),
    user: currentUser.id,
    userName: currentUser.name,
    message: formData.invoiceApproverComment,
    userType: "approver",
    postedAt: new Date().toString(),
  });

  formData.status = formData?.status?.toLowerCase()
    ? formData?.status?.toLowerCase()
    : "unknown";

  formData.piApproveDate = new Date().toString();
  formData.piApproveComment = formData.comment;
  formData.messages = tempMessageList;

  InvoiceModel.updateOne(
    { id: req.params.id },
    { $set: formData },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Something went wrong can't approve.");
      }
    }
  );
}

async function approve(req, res) {
  // Step 1: Prepare variables, Validate Request and important fields
  // ----------------------------------------------------------------
  const ACTION_TO_MESSAGE = {
    approved: "Purchase invoice approved successfully",
    correction: "Purchase invoice send to creator for correction",
    rejected: "Purchase invoice has been rejected",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      action: yup
        .string()
        .oneOf(["approved", "correction", "rejected"])
        .required(),
      message: yup.string().required(),
    })
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
      `Error occurred while store message in pi, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

 

  // Step 4: Update PI details 
  // -------------------------------------------------------------

  // Update PI status as per verifier action
  let piUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
    invoiceApproverComment: FormData.message,
    invoiceApproverDate: new Date().toString(),
  };

  let piUpdateResult = null;

  try {
    piUpdateResult = await InvoiceModel.updateOne(
      { id: req.params.id },
      { $set: piUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in pi, Error: ${err.message}`
    );
  }

  if (!piUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  // Dispatch Event
  EventBus.emit(PI_APPROVED);

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}
module.exports = {
  list,
  get,
  create,
  update,
  correction,
  cancel,
  changeStatus,
  verify,
  approve,
};
