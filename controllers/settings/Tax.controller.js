const { object, string } = require("yup");
const {
  sendResponse,
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { TaxModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const Logger = require("../../helpers/Logger.helper"); 
const ll = "TaxController";

async function list(req, res) {
  const list = await TaxModel.findOne(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list) {
    return requestSuccess(res, list.taxList);
  }
  return requestFail(res, "Can't find any tax");
}

async function getTaxDetails(req, res) {
  const data = await TaxModel.findOne({ id: "GST001" });

  Logger.debug("TaxController", JSON.stringify(data));

  if (data) {
    return requestSuccess(res, data);
  } else {
    return requestFail(res, "somthing went wrong, can't get tax details");
  }
}

async function addTax(req, res) {
  const { body } = req;

  const admin = await getAdmin(req);
  if (!admin) return requestFail(res, "Authrization error");

  const taxSchema = object({
    name: string().required("Name is required"),
    rate: string().required("tax rate is required"),
  });

  try {
    rqData = await taxSchema.validate(body);
  } catch (e) {
    return sendResponse(res, 400, e.message);
  }

  if (!rqData) return requestFail(res, "Something went wrong. Try again");

  let gst = null;

  try {
    gst = await TaxModel.findOne({id: "GST001"});
  } catch (error) {}

  if (!gst) {
    try {
      await new TaxModel({
        id: "GST001",
        gstEnabled: false,
        createdBy: admin.id,
        updatedBy: admin.id,
      }).save();
      gst = { id: "GST001", gstEnabled: false, taxList: [] };
    } catch (error) {}
  }

  let isDuplicate = false;

  gst.taxList.forEach((item) => {
    if (item.name == rqData.name) {
      isDuplicate = true;
    }
  });

  if (isDuplicate) return requestFail(res, "Tax name already in use");
  console.log(rqData, "rqData");
  let newTaxList = [
    ...gst.taxList,
    {
      id: `TAX${generateId(6)}`,
      name: rqData.name,
      rate: rqData.rate,
      status: "inactive",
    },
  ];

  newTaxList = newTaxList.map(function (item) {
    delete item._id;
    return item;
  });
  TaxModel.updateOne(
    { id: "GST001" },
    { $set: { taxList: newTaxList } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't add new tax");
      }
    }
  );
}

async function update(req, res) {
  // Verify request containe a gst id

  // store all request data into gst var
  const FormData = req.body

  // update entry who is updateing the field
  FormData.updatedBy = req.user.id;

  // find gst as per name
  FormData.gstEnabled = FormData.gst == "yes" ? true : false;


  const storedTaxConfiguration = await TaxModel.findOne({ id: "GST001" });

  Logger.silly(ll,storedTaxConfiguration);

  if(storedTaxConfiguration){
    const udpateResponse =  await TaxModel.updateOne(
      { id: "GST001" },
      { $set: { ...FormData } });
  
      Logger.debug(ll,udpateResponse);

      if (udpateResponse.modifiedCount > 0) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Unable to update tax configuration");
      }  
  }else{
    const createRespose = await TaxModel.create({
      id: "GST001",
      ...FormData,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    if (createRespose) {
      return requestSuccess(res);
    } else {
      return requestFail(res, "Unable to update tax configuration");
    } 
  }

}

async function updateTax(req, res) {
  // Verify request containe a tax id
  const { body } = req;

  const admin = await getAdmin(req);
  if (!admin) return requestFail(res, "Authrization error");

  const taxSchema = object({
    name: string().required("Name is required"),
    rate: string().required("tax rate is required"),
  });
  try {
    rqData = await taxSchema.validate(body);
  } catch (e) {
    return sendResponse(res, 400, e.message);
  }

  if (!rqData) return requestFail(res, "Something went wrong. Try again");

  let gst = null;

  try {
    gst = await TaxModel.findOne();
  } catch (error) {}

  if (!gst) {
    TaxModel.create();

    try {
      await new TaxModel({
        id: "GST001",
        gstEnabled: false,
        createdBy: admin.id,
        updatedBy: admin.id,
      }).save();
      gst = { id: "GST001", gstEnabled: false, taxList: [] };
    } catch (error) {}
  }

  let newTaxList = [];

  gst.taxList.forEach((item) => {
    if (item.id == rqData.id) {
      newTaxList.push(rqData);
    } else {
      newTaxList.push(item);
    }
  });

  TaxModel.update(
    { id: "GST001" },
    { $set: { taxList: newTaxList } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't add new tax");
      }
    }
  );
}

async function remove(req, res) {
  const admin = await getAdmin(req);
  if (!admin) return requestFail(res, "Authrization error");

  let gst = null;

  try {
    gst = await TaxModel.findOne();
  } catch (error) {}

  if (!gst) {
    TaxModel.create();

    try {
      await new TaxModel({
        id: "GST001",
        gstEnabled: false,
        createdBy: admin.id,
        updatedBy: admin.id,
      }).save();
      gst = { id: "GST001", gstEnabled: false, taxList: [] };
    } catch (error) {}
  }

  let newTaxList = [];
  gst.taxList.forEach((item) => {
    if (item.id != req.params.id) {
      newTaxList.push(item);
    }
  });
  TaxModel.updateOne(
    { id: "GST001" },
    { $set: { taxList: newTaxList } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't add new tax");
      }
    }
  );
}

module.exports = {
  list,
  addTax,
  update,
  updateTax,
  delete: remove,
  getTaxDetails,
};
