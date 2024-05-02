const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { SubCategoryModel } = require("../../models");
const {
  generateId,
  getAdmin,
  paramProxy,
} = require("../../helpers/Common.helper");
const pipeline = require("../../database/pipelines/inventory/Subcategory.pipeline");

async function list(req, res) {
  const query = await paramProxy(req.query);
  const list = await SubCategoryModel.aggregate(pipeline({ ...query }));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any subcategory");
}

async function get(req, res) {
  // Verify request contained a subcategory id
  if (!req.params.id) {
    return requestFail(res, "Invalid subcategory id");
  }

  // Fetch subcategory detail form database
  const list = await SubCategoryModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find subcategory");
}

async function create(req, res) {
  // get current user
  let ADMIN = await getAdmin();

  // Get data and verify as per need
  let subcategory = req.body;

  if (!ADMIN) return requestFail(res, "Invalid user");

  if (!subcategory.name) {
    return requestFail(res, "Subcategory name is required");
  }

  if (!subcategory.categoryId) {
    return requestFail(res, "Category Id is required");
  }

  if (await SubCategoryModel.findOne({ name: subcategory.name })) {
    return requestFail(res, "Duplicate subcategory name");
  }

  // generate a unique id for subcategory
  const id = `SC${generateId(5)}`;

  // add missing detail in the subcategory object
  subcategory.id = id;
  subcategory.createdBy = ADMIN.id;

  subcategory.updatedBy = ADMIN.id;

  // Now try to create a new subcategory
  try {
    await new SubCategoryModel(subcategory).save();
    return requestSuccess(res);
  } catch (error) {
    return requestFail(
      res,
      "Something went wrong, Can't create subcategory now."
    );
  }
}

async function update(req, res) {
  // Verify request contained a subcategory id
  if (!req.params.id) {
    return requestFail(res, "Invalid subcategory id");
  }

  // store all request data into subcategory var
  let FormData = req.body;

  FormData.updatedBy = req.user.id;

  delete FormData.id;

  let dbRecord = await SubCategoryModel.findOne({ name: FormData.name });

  if (dbRecord) {
    if (dbRecord.id != req.params.id)
    return  requestFail(res, "SubCategory already in use");
  }

  const updateResult = await SubCategoryModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );
  if (updateResult.matchedCount) {
    return requestSuccess(res, "SubCategory updated successfully");
  } else {
    return requestFail(res, "Unable to update subcategory");
  }
}

async function remove(req, res) {
  // Verify request contained a subcategory id
  if (!req.params.id) {
    return requestFail(res, "Invalid SubCategory id");
  }

  const updateResult = await SubCategoryModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );
  if (updateResult.matchedCount) {
    return requestSuccess(res, "SubCategory deleted successfully");
  } else {
    return requestFail(res, "Unable to delete subcategory");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
