const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const mongoose = require("mongoose");

const {
  RFQModel,
  VendorModel,
  StatusHistoryModel,
  RequestModel,
  TermsAndConditionModel,
  ItemModel,
} = require("../../models");
const {
  paramProxy,
  generateNextSerialId,
} = require("../../helpers/Common.helper");
const { generatePdfByHbs } = require("../../helpers/PDF.helper");
const pipeline = require("../../database/pipelines/purchase/RFQ.pipeline");
const { sendMail } = require("../../helpers/Mail.helper");
const { getResourcePath } = require("../../constant/Storage.constant");
const { createDirIfNotExits } = require("../../helpers/File.helper");
const RFQ_STORAGE_DIR = `${getResourcePath()}/purchase/rfq/`;
const { RFQ_CREATED } = require("../../constant/Event.constant");
const Logger = require("../../helpers/Logger.helper");
const ll = "RFQ Controller";

const RFQ_STATUS_LIST = {
  generated: 0,
  cancelled: 0,
  send_to_vender: 1,
  withdrawal: 1,
  quote_receive: 2,
  po_generated: 3,
};

async function list(req, res) {
  const query = await paramProxy(req.query);
  const list = await RFQModel.aggregate(pipeline({ ...query }));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any RFQ");
}

async function get(req, res) {
  const query = await paramProxy(req.query);

  // Verify request contained a rfq id
  if (!req.params.id) {
    return requestFail(res, "Invalid rfq id");
  }

  // Fetch rfq detail form database
  const list = await RFQModel.aggregate(
    pipeline({ id: req.params.id, ...query })
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list && list.length > 0) {
    return requestSuccess(res, list[0]);
  }

  // fail request if nothing worked
  return requestFail(res, "Can not find rfq");
}

async function create(req, res) {
  // Get data and verify as per need
  let FormData = req.body;

  // add validation to create rfq with different vendor,pr and items
  let rfqList = null;

  try {
    rfqList = await RFQModel.find({
      $and: [
        { prRequestId: FormData.prRequestId },
        { vendorId: FormData.vendorId },
      ],
    });
  } catch (err) {
    Logger.error(ll, `RFQ Duplicate Check Error: ${err.message}`);
  }

  if (rfqList && rfqList.length > 0) {
    rfqList.forEach((rfq) => {
      if (rfq.items.length === FormData.items.length) {
        let duplicateItems = [];

        FormData.items.forEach((i) => {
          let tempDuplicateItemRes = rfq.items.filter(
            (dupItem) => dupItem.ipn === i.ipn && i.quantity == dupItem.quantity
          );

          if (tempDuplicateItemRes.length > 0) {
            duplicateItems.push(i);
          }
        });

        if (duplicateItems.length === FormData.items.length) {
          return requestFail(
            res,
            "With provide details RFQ is already created"
          );
        }
      }
    });
  }

  // Generate a unique id for RFQ
  const id = await generateNextSerialId(RFQModel, "RFQ");

  // Add missing detail in the rfq object
  FormData.id = id;
  FormData.status = "generated";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  // Now try to create a new rfq
  try {
    // Create RFQ
    const rfq = await new RFQModel(FormData).save();

    const vendor = await VendorModel.findOne({ id: rfq.vendorId });

    let TermAndCondition = await TermsAndConditionModel.find({
      id: {
        $in: rfq.termAndCondition ?? [],
      },
    });

    TermAndCondition = TermAndCondition.map((i) => i.description);
    if (rfq.additionalTermAndCondition && rfq.additionalTermAndCondition !== "")
      TermAndCondition.push(rfq.additionalTermAndCondition);

    if (!vendor)
      return requestFail(res, "Something went wrong ,Unable to generate RFQ");

    const tempDate = new Date(rfq.createdOn);
    const payloadForPDF = {
      date: `${tempDate.getDate().toString().padStart(2, "0")}/${(
        tempDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${tempDate.getFullYear()}`,
      ref: rfq.prRequestId,
      rfq: rfq.id,
      tac: TermAndCondition ?? [],
      vendor: {
        name: `${vendor.name}`,
        orgName: vendor.personName,
        contact: vendor.contact,
        email: vendor.email,
        address: `${vendor?.billing?.address ?? ""} ${
          vendor?.billing?.city ?? ""
        } ${vendor?.billing?.state ?? ""} ${vendor?.billing?.country ?? ""} 
         ${vendor?.billing?.pinCode ?? ""}`,
      },
      items: [],
    };
    rfq?.items?.forEach(async (item, index) => {
      payloadForPDF.items.push({
        sr: ++index,
        ipn: item.ipn,
        description: item.shortDescription,
        manufacture: item.manufacturer,
        mpn: item.mpn,
        quantity: item.quantity,
        unit: item.unit,
      });
    });

    const pdfName = `RFQ_document_${rfq.id}_${new Date().getTime()}`;
    const pdfRes = await generateRFQpdf(pdfName, payloadForPDF);

    if (pdfRes) {
      await RFQModel.updateOne(
        {
          id: rfq.id,
        },
        {
          $set: {
            pdf: `${pdfName}.pdf`,
            pdfUrl: pdfRes.pdfUrl,
            pdfFilePath: pdfRes.path,
          },
        }
      );
      EventBus.emit(RFQ_CREATED, rfq);
      return requestSuccess(res, {
        id: rfq.id,
        vendor: {
          name: `${vendor.name}`,
          orgName: vendor.personName,
          contact: vendor.contact,
          email: vendor.email,
          address: `${vendor?.billing?.address ?? ""} ${
            vendor?.billing?.city ?? ""
          } ${vendor?.billing?.state ?? ""} 
           ${vendor?.billing?.country ?? ""} ${vendor?.billing?.pinCode ?? ""}`,
        },
        pdfUrl: pdfRes.pdfUrl,
        pdf: `${pdfName}.pdf`,
      });
    }

    // return requestFail(res);
  } catch (error) {
    return requestFail(res);
  }
}

async function update(req, res) {
  // Verify request contained a rfq id
  if (!req.params.id) {
    return requestFail(res, "Invalid rfq id");
  }

  const FormInputs = req.body;

  // update entry who is updating the field
  FormInputs.updatedBy = req.user.id;

  const result = await RFQModel.updateOne(
    { id: req.params.id },
    { $set: { ...FormInputs } }
  );

  if (result.modifiedCount == 1) {
    requestSuccess(res);
  } else {
    requestFail(res, "Can't update RFQ module");
  }
}

async function updateStatus(req, res) {
  // Verify request contained a RFQ id
  if (!req.params.id) {
    return requestFail(res, "Invalid RFQ id");
  }

  // store all request data into rfq var
  let requestBody = req.body;

  // update entry who is updating the field
  requestBody.updatedBy = req.user.id;
  delete requestBody.id;

  RFQModel.updateOne(
    { id: req.params.id },
    { $set: { ...requestBody } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't delete rfq now");
      }
    }
  );
}

async function sendMailToVender(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid RFQ id");

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
        path: `${RFQ_STORAGE_DIR}${requestBody.pdfFile}`,
      },
    ],
  };
  const emailResponse = await sendMail(mailPayload);

  if (emailResponse) {
    const rfqUpdateResponse = await RFQModel.updateOne(
      { id: req.params.id },
      { $set: { status: "send_to_vendor" } }
    );
    if (rfqUpdateResponse) return requestSuccess(res);

    return requestFail(res, "Mail Send but can't update RFQ status.");
  } else {
    return requestFail(
      res,
      "Something went wrong. Can't send mail to vendor now."
    );
  }
}

async function generateRFQpdf(pdf, data) {
  const rfqTemplate = "assets/templates/purchase/rfq/template_1.hbs";
  const pdfFile = `${RFQ_STORAGE_DIR}${pdf}.pdf`;

  createDirIfNotExits(RFQ_STORAGE_DIR);

  try {
    const res = await generatePdfByHbs(rfqTemplate, pdfFile, data);

    if (res) {
      return {
        pdfUrl: `${process.env.APP_URL ?? "http://localhost:5000/"}${pdfFile}`,
        base64: res.base64,
        path: pdfFile,
      };
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
async function withdraw(req, res) {
  // Verify request contained a rfq id
  if (!req.params.id) {
    return requestFail(res, "Invalid rfq id");
  }

  let ADMIN = await getAdmin();

  try {
    await RFQModel.updateOne(
      { id: req.params.id },
      { $set: { status: "Withdraw", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "RFQ Withdraw successfully");
  } catch (error) {
    Logger.error(ll, `Withdraw RFQ Failed, Error: ${error.message}`);

    return requestFail(res, "Can't Withdraw rfq now");
  }
}
async function cancel(req, res) {
  // Verify request contained a rfq id
  if (!req.params.id) {
    return requestFail(res, "Invalid rfq id");
  }

  let ADMIN = await getAdmin();

  try {
    await RFQModel.updateOne(
      { id: req.params.id },
      { $set: { status: "Cancelled", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "RFQ Cancelled successfully");
  } catch (error) {
    Logger.error(ll, `Cancel RFQ Failed, Error: ${error.message}`);

    return requestFail(res, "Can't cancel rfq now");
  }
}
async function action(req, res) {
  if (!req.params.id) return requestFail(res, "Invalid id supplied");

  // Step 1: Prepare variables, Validate Request and important fields
  // ----------------------------------------------------------------
  const ACTION_TO_MESSAGE = {
    send_to_vendor: "RFQ status updated, send to vendor",
    withdraw: "RFQ has been withdrawn and can't be used",
    cancel: "RFQ has been cancelled and can't be used",
  };
  const ACTION_TO_STATUS = {
    send_to_vendor: "send_to_vendor",
    withdraw: "withdraw",
    cancel: "cancel",
  };
  const FormData = req.getValidatedBody(
    yup.object().shape({
      action: yup
        .string()
        .oneOf(["send_to_vendor", "withdraw", "cancel"])
        .required(),
      remark: yup
        .string()
        .when("action", {
          is: "withdraw",
          then: (schema) =>
            schema.required("When action is withdraw then remark is required"),
        })
        .when("action", {
          is: "cancel",
          then: (schema) =>
            schema.required("When action is cancel then remark is required"),
        }),
    }),
    { stripUnknown: true }
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let RFQ = null;

  try {
    RFQ = await RFQModel.findOne({ id: req.params.id });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while get rfq by id. Error: ${err.message}`
    );
  }

  // if (
  //   RFQ_STATUS_LIST[RFQ.status] <=
  //   RFQ_STATUS_LIST[ACTION_TO_STATUS[FormData.action]]
  // ) {
  //   return requestFail(res, `RFQ can not be ${FormData.action}`);
  // }

  if (!RFQ || ["withdraw", "cancel"].includes(RFQ.status))
    return requestFail(res, "RFQ not found.");

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  // Step 2: Generate Status History
  // -----------------------------------------------
  let statusHistoryResult = null;

  try {
    statusHistoryResult = await new StatusHistoryModel({
      parentId: RFQ.id,
      previous: RFQ.status,
      current: ACTION_TO_STATUS[FormData.action],
      createdBy: req.user.id,
    }).save({ session });
  } catch (error) {
    Logger.error(ll, `Status History Error: ${error.message}`);
  }

  if (!statusHistoryResult) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred. Unable to create RFQ");
  }

  // Step 3: Update RFQ details
  // -------------------------------------------------------------

  // Update RFQ status as per user action
  let rfqUpdateFields = {
    status: ACTION_TO_STATUS[FormData.action],
  };

  if (ACTION_TO_STATUS[FormData.action] === ("withdraw" || "cancel")) {
    rfqUpdateFields.statusRemark = FormData.remark;
  }

  // Save change to database
  let rfqUpdateResult = null;
  try {
    rfqUpdateResult = await RFQModel.updateOne(
      { id: req.params.id },
      { $set: rfqUpdateFields },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while store message in RFQ, Error: ${err.message}`
    );
  }

  // Is able to save change in database
  if (!rfqUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    return requestFail(res, "Unexpected error occurred");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  return requestSuccess(res, ACTION_TO_MESSAGE[FormData.action]);
}

function getItemConditions(item) {
  return {
    id: item.id,
    quantity: item.quantity,
    total: item.total,
    ipn: item.ipn,
    manufacturer: item.manufacturer,
    mpn: item.mpn,
    shortDescription: item.shortDescription,
    unit: item.unit,
  };
}

module.exports = {
  list,
  get,
  create,
  update,
  updateStatus,
  sendMailToVender,
  cancel,
  withdraw,
  action,
};
