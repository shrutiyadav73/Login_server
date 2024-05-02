const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { ManufactureModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");

async function list(req, res) {
  const list = await ManufactureModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any manufacture");
}

async function get(req, res) {
  // Verify request contained a manufacture id
  if (!req.params.id) {
    return requestFail(res, "Invalid manufacture id");
  }

  // Fetch manufacture detail form database
  const list = await ManufactureModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find manufacture");
}

async function create(req, res) {
  // get current user
  let ADMIN = await getAdmin();

  // Get data and verify as per need
  let manufacture = req.body;

  if (!manufacture.name) {
    return requestFail(res, "Manufacture name is required");
  }

  if (await ManufactureModel.findOne({ name: manufacture.name })) {
    return requestFail(res, "Duplicate manufacture name");
  }

  // generate a unique id for manufacture
  const id = `MFT${generateId(5)}`;

  // add missing detail in the manufacture object
  manufacture.id = id;
  manufacture.status = manufacture.status ? manufacture.status : "active";
  manufacture.createdBy = ADMIN.id;
  manufacture.updatedBy = ADMIN.id;

  // Now try to create a new manufacture
  try {
    await new ManufactureModel(manufacture).save();
    return requestSuccess(res);
  } catch (error) {}

  return requestFail(
    res,
    "Something went wrong, Can't create manufacture now."
  );
}

async function update(req, res) {
  // Verify request contained a manufacture id
  if (!req.params.id) {
    return requestFail(res, "Invalid manufacture id");
  }

  // store all request data into manufacture var
  let FormData = req.body;

  FormData.updatedBy = req.user.id;

  if (FormData.id && req.params.id != FormData.id)
    return requestFail(res, "Something went wrong, Can't update manufacture");

  delete FormData.id;

  // find manufacture as per name
  let dbRecord = await ManufactureModel.findOne({
    name: FormData.name,
  });

  if (dbRecord) {
    if (dbRecord.id != req.params.id)
      return requestFail(res, "Manufacture already in use");
  }

  const updateResult = await ManufactureModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Manufacture updated successfully");
  } else {
    return requestFail(res, "Unable to update Manufacture");
  }
}

async function remove(req, res) {
  // Verify request contained a manufacture id
  if (!req.params.id) {
    return requestFail(res, "Invalid manufacture id");
  }

  const updateResult = await ManufactureModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Manufacture deleted successfully");
  } else {
    return requestFail(res, "Unable to delete Manufacture");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
