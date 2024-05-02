const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { WarehouseModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const Logger = require("../../helpers/Logger.helper");
const LL = "Warehouse.controller";

async function getAllWarehouseList(req, res) {
  const list = await WarehouseModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find warehouse");
}

async function getWarehouseById(req, res) {
  // Verify request contained a warehouse id
  if (!req.params.id) {
    return requestFail(res, "Invalid warehouse id");
  }

  // Fetch warehouse detail form database
  const list = await WarehouseModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find warehouse");
}

async function createWarehouse(req, res) {
  Logger.debug(LL, "Request receive to create warehouse");
  // validate warehouse create data
  let warehouse = null;
  try {
    warehouse = await canCreateWarehouse(req.body);
  } catch (error) {
    return requestFail(res, error.message);
  }

  if (await WarehouseModel.findOne({ name: warehouse.name })) {
    return requestFail(res, "Duplicate warehouse name");
  }

  if (await WarehouseModel.findOne({ gstNumber: warehouse.gstNumber })) {
    return requestFail(res, "GST Number already in use");
  }

  // generate a unique id for warehouse
  const id = `WH${generateId(5)}`;

  // add missing detail in the warehouse object
  warehouse.id = id;
  warehouse.createdBy = req.user.id;
  warehouse.updatedBy = req.user.id;

  // Now try to create a new warehouse
  try {
    const result = await new WarehouseModel(warehouse).save();
    return requestSuccess(res, "Warehouse created successfully", result);
  } catch (error) {
    Logger.debug(LL, error);
    // Now fail the request
    return requestFail(
      res,
      "Something went wrong, Can't create warehouse now."
    );
  }
}

async function update(req, res) {
  // Verify request contained a warehouse id
  if (!req.params.id) {
    return requestFail(res, "Invalid warehouse id");
  }

  let FormData = req.body;
  FormData.updatedBy = req.user.id;

  delete FormData.id;

  // find warehouse as per name

  let dbRecord = await WarehouseModel.findOne({ name: FormData.name });

  if (dbRecord) {
    if (dbRecord.id != req.params.id)
     return requestFail(res, "Warehouse already in use");
  }

  let dbRecordByGst = await WarehouseModel.findOne({
    gstNumber: FormData.gstNumber,
  });

  if (dbRecordByGst) {
    if (dbRecordByGst.id != req.params.id)
    return requestFail(res, " GST Number already in use");
  }

  const updateResult = await WarehouseModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Warehouse updated successfully");
  } else {
    return requestFail(res, "Unable to update warehouse");
  }
}

async function deleteWarehouse(req, res) {
  // Verify request contained a warehouse id
  if (!req.params.id) {
    return requestFail(res, "Invalid warehouse id");
  }

  const updateResult = await WarehouseModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "warehouse deleted successfully");
  } else {
    return requestFail(res, "unable to delete warehouse");
  }
}

module.exports = {
  index: getAllWarehouseList,
  get: getWarehouseById,
  create: createWarehouse,
  update: update,
  delete: deleteWarehouse,
};

// Create warehouse validation schema ========================================================
async function canCreateWarehouse(object) {
  const schema = yup.object().shape({
    name: yup.string().required(),
    contact: yup.string().required(),
    address: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    country: yup.string().required(),
    pincode: yup
      .string()
      .required()
      .matches(/^\d{6}$/),
    status: yup.string().oneOf(["active", "inactive", "closed"]).required(),
  });

  return await schema.validate(object);
}
