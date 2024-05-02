const mongoose = require("mongoose");
const path = require("path");

const {
  PurchaseOrderModel,
  MessageModel,
  VendorModel,
} = require("../../models");

const { generatePdfByHbs } = require("../../helpers/PDF.helper");
const { getResourcePath } = require("../../constant/Storage.constant");
const { createDirIfNotExits } = require("../../helpers/File.helper");
const {
  getAdmin,
  paramProxy,
  generateNextSerialId,
  generatePassword,
  generateRandomString,
  convertIntToWord,
  fallbackValue,
  formateDate,
} = require("../../helpers/Common.helper");

const {
  requestSuccess,
  requestFail,
  requestFailWithError,
  reqFail,
} = require("../../helpers/RequestResponse.helper");

const {
  PO_CREATED,
  PO_VERIFIED,
  PO_APPROVED,
  PO_CORRECTION_SAVED,
  PO_UPDATED,
} = require("../../constant/Event.constant");

const pipeline = require("../../database/pipelines/purchase/Order.pipeline");
const Logger = require("../../helpers/Logger.helper");
const { sendMail } = require("../../helpers/Mail.helper");
const ll = "Purchase Order Controller";
const PO_STORAGE_DIR = `${getResourcePath()}/purchase/po/`;

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
        poVerifierId: req.user.id,
      });
    if (query.listType === "approval")
      return getList(req, res, {
        status: "in_approval",
        poApproverId: req.user.id,
      });
  }

  return getList(req, res, query);
}

async function getList(req, res, query = {}) {
  const list = await PurchaseOrderModel.aggregate(
    pipeline.generalList({ ...query })
  );

  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Not found.");
}

async function getById(req, res) {
  const query = await paramProxy(req.query);

  // Verify request contained a order id
  if (!req.params.id) return requestFail(res, "Invalid order id");

  // Fetch order detail form database
  const list = await PurchaseOrderModel.aggregate(
    pipeline.list({ id: req.params.id, ...query })
  );

  if (!list || list.length == 0) return reqFail(res, 404, "Not found");

  let item = list[0];
  return requestSuccess(res, item);
}

async function create(req, res) {
  // Get data and verify as per need
  let FormData = null;

  try {
    FormData = await canCreateOrder(req.body);
  } catch (error) {
    return requestFail(res, error.message);
  }

  if (
    await PurchaseOrderModel.findOne({ voucherNumber: FormData.voucherNumber })
  ) {
    return requestFail(res, "Duplicate Voucher Number");
  }

  // generate a unique id for order
  const id = await generateNextSerialId(PurchaseOrderModel, "PO");

  // add missing detail in the order object
  FormData.id = id;
  FormData.status = "in_verification";
  FormData.createdBy = req.user?.id;
  FormData.updatedBy = req.user?.id;
  FormData.total = FormData?.items?.reduce((a, b) => {
    return a + b.total;
  }, 0);

  // Now try to create a new order
  try {
    const poResult = await new PurchaseOrderModel(FormData).save();

    EventBus.emit(PO_CREATED, poResult);

    return requestSuccess(res);
  } catch (error) {
    return requestFail(res, error.message);
  }
}

async function update(req, res) {
  const FormData = req.getValidatedBody(
    yup.object().shape({
      quotationId: yup.string().required(),
      voucherNumber: yup.string().required(),
      poVerifierId: yup.string().required(),
    })
  );

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  FormData.updatedBy = req.user.id;
  FormData.status = "in_verification";
  FormData.total = FormData?.items?.reduce((a, b) => {
    return a + parseFloat(b.total ?? "0");
  }, 0);

  // Removing id form FormData because don't need to update purchase order id
  delete FormData.id;

  const preUpdatedPOo = await PurchaseOrderModel.findOne({ id: req.params.id });

  let poUpdateResult = null;

  try {
    poUpdateResult = await PurchaseOrderModel.updateOne(
      { id: req.params.id },
      { $set: { ...FormData } },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while updating purchase order: ${err.message}`
    );
  }

  if (!poUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    session.endSession();
    return requestFail(res, "No changes made to the purchase order");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  // Dispatch Event
  const updatedPO = await PurchaseOrderModel.findOne({ id: req.params.id });
  EventBus.emit(PO_UPDATED, updatedPO, preUpdatedPOo);

  return requestSuccess(res, "Purchase order updated successfully");
}

async function correction(req, res) {
  // Step 1: Check params have purchase order id
  if (!req.params.id) return requestFail(res, "Invalid request, Id is missing");

  // store all request data into order var
  const FormData = req.body;
  const prePo = await PurchaseOrderModel.findOne({ id: req.params.id });

  FormData.updatedBy = req.user.id;
  FormData.status = "in_verification";
  FormData.total = FormData?.items?.reduce((a, b) => {
    return a + parseFloat(b.total ?? "0");
  }, 0);

  delete FormData.id;

  // Starting mongo db session

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
      `Error occurred while store message in po, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  //

  let updatePurchaseOrderResult = null;
  try {
    updatePurchaseOrderResult = await PurchaseOrderModel.updateOne(
      { id: req.params.id },
      { $set: FormData }
    );
  } catch (err) {
    Logger.error(ll, `PO Correction Error: ${err.message}`);
  }

  if (
    !updatePurchaseOrderResult ||
    updatePurchaseOrderResult.modifiedCount !== 1
  ) {
    await session.abortTransaction();
    return requestFail(
      res,
      `Unexpected error occurred, Unable to save changes`
    );
  }

  await session.commitTransaction();
  await session.endSession();

  EventBus.emit(PO_CORRECTION_SAVED, FormData);
  EventBus.emit(PO_UPDATED, FormData, prePo);

  return requestSuccess(
    res,
    `PO changes has been saved and moved for verification`
  );
}

async function changeStatus(req, res) {
  if (!req.params.id || !req.params.status) return requestFail(res);

  // store all request data into order var
  let formData = req.body,
    currentUser = await getAdmin();

  if (!currentUser) return requestFail(res, "Unauthorized request");

  // update entry who is updating the field
  formData.updatedBy = currentUser.id;

  // get pr request from database
  let tempPOObj = null;

  try {
    tempPOObj = await PurchaseOrderModel.findOne({ id: req.params.id });
  } catch (error) {}

  if (!tempPOObj) return requestFail(res);

  let tempMessageList = tempPOObj.messages ?? [];

  if (!Array.isArray(tempMessageList)) {
    tempMessageList = [];
  }

  tempMessageList.push({
    id: generatePassword(17),
    user: currentUser.id,
    userName: currentUser.name,
    message: formData.comment,
    userType: formData.userType,
    postedAt: new Date().toString(),
  });

  formData.status = formData?.status?.toLowerCase()
    ? formData?.status?.toLowerCase()
    : "unknown";

  // formData.poApproveDate = new Date().toString();
  // formData.poApproverComment = formData.comment;
  // formData.messages = tempMessageList;

  PurchaseOrderModel.updateOne(
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

async function canCreateOrder(object) {
  const schema = yup.object().shape({
    prId: yup.string().required(),
    quotationId: yup.string().required(),
    vendorId: yup.string().required(),
    voucherNumber: yup.string().required(),
    items: yup.array().of(
      yup.object().shape({
        ipn: yup.string().required("IPN is required"),
        quantity: yup.string().required("Quantity is required"),
      })
    ),
  });

  return await schema.validate(object);
}

async function verify(req, res) {
  const ACTION_TO_MESSAGE = {
    verified: "Purchase order verified successfully",
    correction: "Purchase order send to creator for correction",
    rejected: "Purchase order has been rejected",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      action: yup
        .string()
        .oneOf(["verified", "correction", "rejected"])
        .required(),
      message: yup.string().required(),
      poApproverId: yup.string(),
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
      `Error occurred while store message in po, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Update PO status as per verifier action

  let poUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
    poVerifierComment: FormData.message,
    poVerifyDate: new Date().toString(),
  };

  if (FormData.action === "verified")
    poUpdateFields.poApproverId = FormData.poApproverId;

  let poUpdateResult = null;
  try {
    poUpdateResult = await PurchaseOrderModel.updateOne(
      { id: req.params.id },
      { $set: poUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in po, Error: ${error.message}`
    );
  }

  if (!poUpdateResult.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  await session.commitTransaction();
  session.endSession();

  // Dispatch Event
  EventBus.emit(
    PO_VERIFIED,
    await PurchaseOrderModel.find({ id: req.params.id })
  );

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}

async function approve(req, res) {
  // Step 1: Prepare variables, Validate Request and important fields
  // ----------------------------------------------------------------
  const ACTION_TO_MESSAGE = {
    approved: "Purchase order approved successfully",
    correction: "Purchase order send to creator for correction",
    rejected: "Purchase order has been rejected",
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
      `Error occurred while store message in po, Error: ${error.message}`
    );
  }

  if (!messageResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Step 3: Generate PO document PDF
  // ---------------------------------

  // Get latest details of purchase order
  const updatedPO = (
    await PurchaseOrderModel.aggregate(pipeline.list({ id: req.params.id }))
  )[0];

  // Generate PO Document
  let poDocument = null;

  try {
    poDocument = await generatePODocument(updatedPO);
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while generating PO Document, Error: ${err.message}`
    );
  }

  if (!poDocument) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred.");
  }

  // Step 4: Update PO details and attache generated PO Document
  // -------------------------------------------------------------

  // Update PO status as per verifier action
  let poUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
    poApproverComment: FormData.message,
    poApproveDate: new Date().toString(),
    poDocument: poDocument,
  };

  let poUpdateResult = null;

  try {
    poUpdateResult = await PurchaseOrderModel.updateOne(
      { id: req.params.id },
      { $set: poUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in po, Error: ${err.message}`
    );
  }

  if (!poUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  // Dispatch Event
  EventBus.emit(PO_APPROVED, updatedPO);

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}

async function generatePODocument(updatedPO) {
  // get vendor details
  const vendor = await VendorModel.findOne({ id: updatedPO.vendorId });

  if (!vendor) return false;

  // Prepare PO document data
  const poPdfData = {};
  poPdfData.po_number = fallbackValue(updatedPO.id);
  poPdfData.po_date = formateDate(fallbackValue(updatedPO.poApproveDate), {
    withTime: false,
  });
  poPdfData.voucher_no = fallbackValue(updatedPO.voucherNumber);
  poPdfData.voucher_date = formateDate(fallbackValue(updatedPO.voucher_date), {
    withTime: false,
  });
  poPdfData.other_ref = fallbackValue(updatedPO.quotationId);
  poPdfData.despatch_through = fallbackValue(updatedPO.dispatchThrough);
  poPdfData.destination = fallbackValue(updatedPO.destination);
  poPdfData.loading_place = fallbackValue(updatedPO.portOfLoading);
  poPdfData.discharge_place = fallbackValue(updatedPO.portOfDischarge);
  poPdfData.payment_mode = fallbackValue(updatedPO.paymentMode);
  poPdfData.tnc = "";

  poPdfData.tnc = fallbackValue(poPdfData.tnc);

  poPdfData.accounts = {
    item_total: 0,
    sub_total: 0,
    gst_applied: true,
    gst_igst_applied: false,
    gst_cgst: 0,
    gst_sgst: 0,
    gst_igst: 0,
    grand_total: 0,
    grand_total_in_words: "",
  };

  // Iterate over items
  poPdfData.items = updatedPO.items.map((i, index) => {
    poPdfData.accounts.item_total = index + 1;
    poPdfData.accounts.sub_total += parseFloat(
      (i.quantity * i.rate).toFixed(2)
    );
    return {
      sr_no: index + 1,
      ipn: i.ipn,
      description: fallbackValue(i.shortDescription),
      quantity: i.quantity,
      rate: parseFloat(i.rate).toFixed(2),
      amount: (i.quantity * i.rate).toFixed(2),
      hsn_sac: fallbackValue(i.hsn_sac),
      unit: fallbackValue(i.unit),
    };
  });

  if (vendor.billing.country.toLowerCase() !== "india") {
    poPdfData.accounts.gst_applied = false;
  } else {
    if (vendor.billing.state == "karnataka") {
      poPdfData.accounts.gst_cgst = (9 / 100) * poPdfData.accounts.sub_total;
      poPdfData.accounts.gst_sgst = (9 / 100) * poPdfData.accounts.sub_total;
      poPdfData.accounts.gst_igst_applied = false;
    } else {
      poPdfData.accounts.gst_sgst = (9 / 100) * poPdfData.accounts.sub_total;
      poPdfData.accounts.gst_igst = (9 / 100) * poPdfData.accounts.sub_total;
      poPdfData.accounts.gst_igst_applied = true;
    }

    poPdfData.accounts.gst_cgst = parseFloat(
      poPdfData.accounts.gst_cgst.toFixed(2)
    );
    poPdfData.accounts.gst_sgst = parseFloat(
      poPdfData.accounts.gst_sgst.toFixed(2)
    );
    poPdfData.accounts.gst_igst = parseFloat(
      poPdfData.accounts.gst_igst.toFixed(2)
    );
  }

  poPdfData.accounts.grand_total =
    poPdfData.accounts.gst_cgst +
    poPdfData.accounts.gst_sgst +
    poPdfData.accounts.gst_igst +
    poPdfData.accounts.sub_total;

  poPdfData.accounts.grand_total_in_words = convertIntToWord(
    poPdfData.accounts.grand_total
  );

  poPdfData.vendor = {
    name: vendor.name,
    gst: vendor.gstNumber ?? "-",
    state: vendor.billing.state,
    address: `${vendor.billing.address}, ${vendor.billing.city}, ${vendor.billing.state}, ${vendor.billing.country}, ${vendor.billing.pinCode}`,
    contact: vendor.personName,
    email: vendor.personEmail,
    phone: vendor.personContactNumber,
    code: vendor.billing.stateCode ?? "-",
  };

  const pdf = `${updatedPO.id}-${Date.now()}`;
  const rfqTemplate = "assets/purchase/PO/template_html.hbs";
  const pdfFile = `${PO_STORAGE_DIR}${pdf}.pdf`;

  createDirIfNotExits(PO_STORAGE_DIR);

  try {
    const res = await generatePdfByHbs(rfqTemplate, pdfFile, poPdfData);
    if (res) {
      return {
        pdfUrl: path.join(
          process.env.APP_URL ?? "http://localhost:5000/",
          pdfFile
        ),
        base64: res.base64,
        path: pdfFile,
      };
    } else {
      return false;
    }
  } catch (error) {
    Logger.error(ll, `Generate PDF Failed, Error: ${error.message}`);
    return false;
  }
}

async function sendMailToVender(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid Order id");

  const requestBody = req.body;
  requestBody.updatedBy = req.user.id;
  delete requestBody.id;

  const mailPayload = {
    priority: "high",
    replyTo: requestBody.replyTo,
    to: requestBody.sendTo,
    cc: requestBody.replyTo,
    message: requestBody.mail,
    subject: requestBody.subject,
    attachments: [
      {
        filename: requestBody.pdfFile,
        path: `${PO_STORAGE_DIR}${requestBody.pdfFile}`,
      },
    ],
  };
  const emailResponse = await sendMail(mailPayload);

  if (emailResponse) {
    const orderUpdateResponse = await OrderModel.updateOne(
      { id: req.params.id },
      { $set: { status: "send_to_vendor" } }
    );
    if (orderUpdateResponse) return requestSuccess(res);

    return requestFail(res, "Mail Send but can't update PO status.");
  } else {
    return requestFail(
      res,
      "Something went wrong. Can't send mail to vendor now."
    );
  }
}

async function cancel(req, res) {
  // Verify request contained a order id
  if (!req.params.id) {
    return requestFail(res, "Invalid order id");
  }

  let ADMIN = await getAdmin();

  try {
    await PurchaseOrderModel.updateOne(
      { id: req.params.id },
      { $set: { status: "Cancelled", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "Order Cancelled successfully");
  } catch (error) {
    Logger.error(ll, `Cancel Order Failed, Error: ${error.message}`);
    return requestFail(res, "Can't cancel order now");
  }
}

module.exports = {
  list,
  get: getById,
  create,
  sendMailToVender,
  update,
  correction,
  changeStatus,
  verify,
  approve,
  cancel,
};
