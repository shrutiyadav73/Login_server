const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const { IndentorModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const Logger = require("../../helpers/Logger.helper");
const LoggerLabel = "Purchase|Item.Controller";

async function list(req, res) {
  const list = await IndentorModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any indentor");
}

async function get(req, res) {
  // Verify request contains an indentor id
  if (!req.params.id) {
    return requestFail(res, "Invalid indentor id");
  }

  // Fetch indentor detail form database
  const list = await IndentorModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find indentor");
}

async function create(req, res) {
  const FormData = req.getValidatedBody(
    yup.object().shape({
      email: yup.string().required(),
      contact: yup.string().required(),
      name: yup.string().required(),
      department: yup.string().required(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let duplicateIndentor = null;

  try {
    duplicateIndentor = await IndentorModel.findOne({
      $or: [{ email: FormData.email }, { name: FormData.name }],
    });
  } catch (err) {
    Logger.error(
      LoggerLabel,
      `Error Occurred while finding indentor, Error: ${err.message}`
    );
  }

  if (duplicateIndentor && duplicateIndentor.email === FormData.email) {
    return requestFailWithError(res, [
      {
        name: "email",
        errors: ["Email already in use."],
      },
    ]);
  }

  // Test name duplicacy
  if (duplicateIndentor && duplicateIndentor.name === FormData.name) {
    return requestFailWithError(res, [
      {
        name: "name",
        errors: ["name is already in use."],
      },
    ]);
  }

  // if (!FormData.name) {
  //   return requestFail(res, "Indentor name is required");
  // }

  // if (await IndentorModel.findOne({ name: FormData.name })) {
  //   return requestFail(res, "Duplicate indentor name");
  // }

  // if (await IndentorModel.findOne({ email: FormData.email })) {
  //   return requestFail(res, "Duplicate indentor email");
  // }

  // generate a unique id for indentor
  const id = `IND${generateId(5)}`;

  // add missing detail in the indentor object
  FormData.id = id;
  FormData.status = "active";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  // Now try to create a new indentor
  try {
    await new IndentorModel(FormData).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create indentor now.");
}

async function update(req, res) {
  // Verify request contains a indentor id
  if (!req.params.id) {
    return requestFail(res, "Invalid indentor id");
  }

  const FormData = req.getValidatedBody(
    yup.object().shape({
      name: yup.string().required(),
      email: yup.string().required(),
      contact: yup.string().required(),
      department: yup.string().required(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  // Check duplication item via IPN

  let IndentorByName = null;
  try {
    IndentorByName = await IndentorModel.findOne({ name: FormData.name });
  } catch (err) {
    Logger.error(LoggerLabel, `Indentor Duplicate Check Error: ${err.message}`);
  }

  if (IndentorByName && req.params.id !== IndentorByName.id) {
    return requestFailWithError(res, [
      { name: "name", errors: ["Duplicate indentor, Name already in use."] },
    ]);
  }

  // Check duplication item via HSN/SAC
  let IndentorByEmail = null;
  try {
    IndentorByEmail = await IndentorModel.findOne({ email: FormData.email });
  } catch (err) {
    Logger.error(LoggerLabel, `Indentor Duplicate Check Error: ${err.message}`);
  }

  if (IndentorByEmail && req.params.id !== IndentorByEmail.id) {
    return requestFailWithError(res, [
      { name: "email", errors: ["Duplicate indentor, Email already in use."] },
    ]);
  }

  FormData.updatedBy = req.user.id;

  // if (FormData.id && req.params.id != FormData.id)
  //   return requestFail(res, "Something went wrong, Can't update indentor");

  delete FormData.id;

  // find indentor as per name
  // let dbRecord = await IndentorModel.findOne({
  //   name: FormData.name,
  // });

  // if (dbRecord) {
  //   if (dbRecord.id != req.params.id)
  //     return requestFail(res, "Indentor already in use");
  // }

  const updateResult = await IndentorModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Indentor updated successfully");
  } else {
    return requestFail(res, "Unable to update indentor");
  }
}

async function remove(req, res) {
  // Verify request contains a indentor id
  if (!req.params.id) {
    return requestFail(res, "Invalid indentor id");
  }

  const updateResult = await IndentorModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Indentor deleted successfully");
  } else {
    return requestFail(res, "Unable to delete indentor");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
