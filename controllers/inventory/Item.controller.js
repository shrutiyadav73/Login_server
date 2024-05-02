const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const { ItemModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");

const pipeline = require("../../database/pipelines/inventory/item.pipeline");
const { linkFiles, unlinkAllFiles } = require("../Storage.controller");
const Logger = require("../../helpers/Logger.helper");
const LoggerLabel = "Purchase|Item.Controller";

async function list(req, res) {
  let defaultQuery = { ...req.query };
  const list = await ItemModel.aggregate(pipeline(defaultQuery));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find item");
}

async function itemById(req, res) {
  // Verify request contained a item id
  if (!req.params.id) {
    return requestFail(res, "Invalid item id");
  }

  // Fetch item detail form database
  const list = await ItemModel.findOne(
    {
      status: { $ne: "deleted" },
      id: req.params.id,
      ...req.query,
    },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find item");
}

async function create(req, res) {
  const FormData = req.getValidatedBody(
    yup.object().shape({
      ipn: yup.string().required(),
      categoryId: yup.string().required(),
      unit: yup.string().required(),
      hsn_sac: yup.string().required("HSN/SAC is a required field"),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  // generate a unique id for item
  const id = `I${generateId(5)}`;

  // add missing detail in the item object
  FormData.id = id;
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  let duplicateItem = null;

  try {
    duplicateItem = await ItemModel.findOne({
      $or: [{ ipn: FormData.ipn }],
    });
  } catch (err) {
    Logger.error(
      LoggerLabel,
      `Error Occurred while finding item, Error: ${err.message}`
    );
  }

  if (duplicateItem && duplicateItem.ipn === FormData.ipn) {
    return requestFailWithError(res, [
      {
        name: "ipn",
        errors: ["IPN already in use."],
      },
    ]);
  }

  // Now try to create a new item
  try {
    const result = await new ItemModel(FormData).save();

    await linkFiles(result.id, result.files ?? []);

    result.manufacturer.forEach(async (FormData) => {
      await linkFiles(result.id, FormData.datasheet ?? []);
    });

    await linkFiles(result.id, result.thumbnails ?? []);

    console.log(result, "result");
    Logger.http(LoggerLabel, `Item ${result.id} created successfully`);
    return requestSuccess(res);
  } catch (error) {
    Logger.http(LoggerLabel, `Item creation failed, Duo to ${error.message}`);
    Logger.error(LoggerLabel, error);
    return requestFail(res, "Something went wrong, Can't create item now.");
  }
}

async function update(req, res) {
  // Verify request contained a item id
  if (!req.params.id) {
    return requestFail(res, "Invalid item id");
  }

  const FormData = req.getValidatedBody(
    yup.object().shape({
      ipn: yup.string().required(),
      categoryId: yup.string().required(),
      unit: yup.string().required(),
      hsn_sac: yup.string().required("HSN/SAC is a required field"),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  // Check duplication item via IPN

  let ItemByIPN = null;
  try {
    ItemByIPN = await ItemModel.findOne({ ipn: FormData.ipn });
  } catch (err) {
    Logger.error(LoggerLabel, `Item Duplicate Check Error: ${err.message}`);
  }

  if (ItemByIPN && req.params.id !== ItemByIPN.id) {
    return requestFailWithError(res, [
      { name: "ipn", errors: ["Duplicate item, IPN already in use."] },
    ]);
  }

  // update entry who is updating the field
  FormData.updatedBy = req.user.id;

  const updateResponse = await ItemModel.updateOne(
    { id: req.params.id, deleted: false },
    { $set: FormData }
  );
  if (updateResponse.matchedCount > 0) {
    try {
      const updatedRecord = await ItemModel.findOne({ id: req.params.id });

      await unlinkAllFiles(updatedRecord.id);

      // Link files with record
      await linkFiles(updatedRecord.id, updatedRecord.files);
      await linkFiles(updatedRecord.id, updatedRecord.thumbnails);

      // Link manufacturer datasheets with record
      updatedRecord.manufacturer.forEach(async (item) => {
        await linkFiles(updatedRecord.id, item.datasheet);
      });
    } catch (error) {
      return requestFail(res, "Can't remove files");
    }
    return requestSuccess(res);
  } else {
    return requestFail(res, "Can't Update item now");
  }
}

async function remove(req, res) {
  // Verify request contained a item id
  if (!req.params.id) {
    return requestFail(res, "Invalid item id");
  }

  let ADMIN = await getAdmin();

  let dbUpdateResult = null;

  try {
    dbUpdateResult = await ItemModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: ADMIN.id } }
    );
  } catch (error) {
    dbUpdateResult = null;
  }

  if (dbUpdateResult && dbUpdateResult.matchedCount > 0) {
    return requestSuccess(res, "Item deleted successfully");
  }

  return requestFail(res, "Can't delete item now");
}

module.exports = {
  list,
  get: itemById,
  create,
  update,
  delete: remove,
};
