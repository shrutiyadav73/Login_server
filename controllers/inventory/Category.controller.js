const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const { CategoryModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const Logger = require("../../helpers/Logger.helper");
const AppConfig = require("../../helpers/Helper");
const ll = "Category Controller";

async function list(req, res) {
  const list = await CategoryModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }

  const categoryData = await CategoryModel.find({}).sort({ ipnPrefix: 1 });

  if (categoryData) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any category");
}

async function get(req, res) {
  // Verify request contained a category id
  if (!req.params.id) {
    return requestFail(res, "Invalid category id");
  }

  const list = await CategoryModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );
  if (list) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find category");
}

async function create(req, res) {
  const FormBody = req.getValidatedBody(
    yup.object({
      name: yup.string().required(),
      ipnPrefix: yup.string(),
      attribute: yup.array().of(yup.object({ name: yup.string().required() })),
      status: yup.string().oneOf(["active", "inactive"]).required(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let haveDuplicateCategory = null;

  try {
    haveDuplicateCategory = await CategoryModel.findOne({
      $or: [{ name: FormBody.name }, { ipnPrefix: FormBody.ipnPrefix }],
    });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while checking category duplicate. Error: ${err.message}`
    );
  }

  if (haveDuplicateCategory) {
    const errors = [];

    if (FormBody.name === haveDuplicateCategory.name) {
      errors.push({
        name: "name",
        errors: ["Category name already in use"],
      });
    }

    if (FormBody.ipnPrefix === haveDuplicateCategory.ipnPrefix) {
      errors.push({
        name: "ipnPrefix",
        errors: ["IPN prefix already in use"],
      });
    }

    return requestFailWithError(res, errors);
  }

  if (FormBody.ipnPrefix === "") {
    FormBody.ipnPrefix = await generateNextIPNPrefix();
  }

  // generate a unique id for category
  const id = `C${generateId(5)}`;

  // add missing detail in the category object
  FormBody.id = id;
  FormBody.createdBy = req.user?.id;
  FormBody.updatedBy = req.user?.id;

  // Now try to create a new category
  try {
    await new CategoryModel(FormBody).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create category now.");
}

async function generateNextIPNPrefix() {
  // Generate IPN prefix
  let lastGeneratedNumber = await AppConfig.get("category-ipn-prefix");
  if (!lastGeneratedNumber) {
    lastGeneratedNumber = 1;
  } else {
    lastGeneratedNumber =
      typeof lastGeneratedNumber !== "number"
        ? parseInt(lastGeneratedNumber)
        : lastGeneratedNumber;
    ++lastGeneratedNumber;
  }

  await AppConfig.set("category-ipn-prefix", lastGeneratedNumber);

  lastGeneratedNumber = lastGeneratedNumber.toString();
  lastGeneratedNumber = lastGeneratedNumber.padStart(3, "0");

  if (await CategoryModel.findOne({ ipnPrefix: lastGeneratedNumber })) {
    return generateNextIPNPrefix();
  }
  return lastGeneratedNumber;
}

async function update(req, res) {
  const FormBody = req.getValidatedBody(
    yup.object({
      name: yup.string(),
      ipnPrefix: yup.string(),
      attribute: yup.array().of(yup.object({ name: yup.string().required() })),
      status: yup.string().oneOf(["active", "inactive"]),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  FormBody.updatedBy = req.user.id;

  // Remove immutable keys
  delete FormBody.id;
  delete FormBody.ipnPrefix;

  // Checkout
  let haveDuplicateCategory = await CategoryModel.findOne({
    name: FormBody.name,
  });

  if (haveDuplicateCategory && haveDuplicateCategory.id != req.params.id)
    return requestFailWithError(res, [
      { name: "name", errors: ["Category Name already in use."] },
    ]);

  const updateResult = await CategoryModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormBody }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Category updated successfully");
  } else {
    return requestFail(res, "Unable to update category");
  }
}

async function remove(req, res) {
  // Verify request contained a category id
  if (!req.params.id) {
    return requestFail(res, "Invalid category id");
  }

  const updateResult = await CategoryModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Category deleted successfully");
  } else {
    return requestFail(res, "Unable to delete category");
  }
}

// Utility functions
module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
