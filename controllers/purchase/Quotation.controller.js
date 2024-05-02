const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { PurchaseQuotation, RFQModel } = require("../../models");

const {
  getAdmin,
  generateNextSerialId,
} = require("../../helpers/Common.helper");
const {
  basicTablePipeline,
  byIpnPipeline,
} = require("../../database/pipelines/purchase/Quotation.pipeline");
const { linkFiles, unlinkAllFiles } = require("../Storage.controller");

async function create(req, res) {
  
  let FormData = null;

  try {
    FormData = await canCreateQuotation(req.body);
  } catch (error) {
    return requestFail(res, error.message);
  }

  const id = await generateNextSerialId(PurchaseQuotation, "QUO");

  // add missing detail in the quotation object
  FormData.id = id;
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  // Now try to create a new quotation
  try {
    const result = await new PurchaseQuotation(FormData).save();
    await linkFiles(result.id, result.quotationFiles);

    await RFQModel.updateOne(
      { id: FormData.rfqId },
      { $set: { status: "quote_receive" } }
    );
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create quotation now.");
}

async function list(req, res) {
  if (req.query.type === "byIpn") return getQuotationsByIPN(req, res);

  let list = await PurchaseQuotation.aggregate(basicTablePipeline());

  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }

  return requestFail(res);
}

async function get(req, res) {
  // Verify request contained a quotation id
  if (!req.params.id) {
    return requestFail(res, "Invalid quotation id");
  }

  // Fetch quotation detail form database
  const list = await PurchaseQuotation.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find quotation");
}

async function update(req, res) {
  const FormData = req.body;

  // update entry who is updating the field
  FormData.updatedBy = req.user.id;
  delete FormData.id;

  const updateResult = await PurchaseQuotation.updateOne(
    { id: req.params.id },
    { $set: { ...FormData } }
  );

  if (updateResult.matchedCount) {
    const dbQuotation = await PurchaseQuotation.findOne({ id: req.params.id });
    await unlinkAllFiles(dbQuotation.id);
    await linkFiles(dbQuotation.id, dbQuotation.quotationFiles);

    requestSuccess(res, "Quotation updated successfully");
  } else {
    return requestFail(res, "Unable to update quotation");
  }
}

async function getQuotationsByIPN(req, res) {
  const { ipn } = req.query;

  if (ipn === "") return requestFail(res, "Missing parameters");

  const list = await PurchaseQuotation.aggregate(byIpnPipeline(ipn));

  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }

  return requestFail(res);
}

async function cancel(req, res) {
  // Verify request contained a quotation id
  if (!req.params.id) {
    return requestFail(res, "Invalid quotation id");
  }

  let ADMIN = await getAdmin();

  try {
    await PurchaseQuotation.updateOne(
      { id: req.params.id },
      { $set: { status: "Cancelled", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "Quotation Cancelled successfully");
  } catch (error) {
    print(error);
    return requestFail(res, "Can't cancel quotation now");
  }
}

async function canCreateQuotation(object) {
  const schema = yup.object().shape({
    venderQuotationId: yup.string().required(),
    quotationDate: yup.string().required(),
    quotationValidity: yup.string().required(),
    quotationCurrency: yup.string().required(),
    quotationFiles: yup.array().of(yup.object().shape({
      id:yup.string().required(),
      preview:yup.string().required(),
      type:yup.string(),
      name:yup.string()
    })).min(1,'Atleast one quotaion file is required')
  });

  return await schema.validate(object);
}

module.exports = {
  create,
  list,
  get,
  update,
  cancel,
};
