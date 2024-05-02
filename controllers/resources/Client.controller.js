const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");
const {
  generateId,
  getAdmin,
  paramProxy,
} = require("../../helpers/Common.helper");
const pipeline = require("../../database/pipelines/setting/Client.pipeline");
const { ClientModel, StatusHistoryModel } = require("../../models");
const Logger = require("../../helpers/Logger.helper");
const ll = "Client Controller";
const { default: mongoose } = require("mongoose");

async function list(req, res) {
  const query = await paramProxy(req.query);
  const list = await ClientModel.aggregate(pipeline({ ...query }));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any client");
}

async function get(req, res) {
  // Verify request contained a client id
  if (!req.params.id) {
    return requestFail(res, "Invalid client id");
  }

  // Fetch client detail form database
  const list = await ClientModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find client");
}

async function create(req, res) {
  const FormData = req.getValidatedBody(
    yup.object().shape({
      name: yup.string().required(),
      email: yup.string().required().email(),
      personName: yup.string().required("Contact person name is required"),
      personEmail: yup.string().required("Contact person email is required"),
      personContactNumber: yup
        .string()
        .required("Contact person number is required"),
      panNumber: yup
        .string()

        .when("$exist", {
          is: (exist) => exist,
          then: yup
            .string()
            .trim()
            .matches(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/, "Invalid PAN Number"),
        }),

      gstNumber: yup.string().when("$exist", {
        is: (exist) => exist,
        then: yup
          .string()
          .trim()
          .matches(
            /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}Z[0-9a-zA-Z]{1}$/,
            "Invalid GST Number"
          ),
      }),

      billing: yup.object({
        address: yup.string().required(),
        city: yup.string().required(),
        state: yup.string().required(),
        stateCode: yup.string(),
        country: yup.string().required(),
        pinCode: yup.string().required(),
      }),
      shipping: yup.object({
        address: yup.string().required(),
        city: yup.string().required(),
        state: yup.string().required(),
        stateCode: yup.string(),
        country: yup.string().required(),
        pinCode: yup.string().required(),
      }),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  let duplicateClient = null;

  try {
    duplicateClient = await ClientModel.findOne({
      $or: [{ name: FormData.name }, { email: FormData.email }],
    });
  } catch (err) {
    Logger.error(ll, `Client Duplicate Check Error: ${err.message}`);
  }

  if (duplicateClient) {
    let message = null;

    if (FormData.name === duplicateClient.name)
      message = "Client name already is use. Enter a unique Client name.";
    if (FormData.email === duplicateClient.email)
      message = "Client email already is use. Enter a unique Client email.";

    return requestFail(res, message);
  }

  // generate a unique id for client
  const id = `CL${generateId(5)}`;
  // add missing detail in the client object
  FormData.id = id;
  FormData.status = "active";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;
  // Now try to create a new client
  try {
    await new ClientModel(FormData).save();
    return requestSuccess(res);
  } catch (error) {
    Logger.error(
      ll,
      `Error occurred while creating client. Error: ${error.message}`
    );
  }

  return requestFail(res, "Something went wrong, Can't create client now.");
}

async function update(req, res) {
  // Verify request contained a client id
  if (!req.params.id) {
    return requestFail(res, "Invalid client id");
  }

  const FormData = req.getValidatedBody(
    yup.object().shape({
      name: yup.string().required(),
      email: yup.string().required().email(),
      personName: yup.string().required("Contact person name is required"),
      personEmail: yup.string().required("Contact person email is required"),
      personContactNumber: yup
        .string()
        .required("Contact person number is required"),
      panNumber: yup
        .string()
        .when("$exist", {
          is: (exist) => exist,
          then: yup
            .string()
            .trim()
            .matches(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/, "Invalid PAN Number"),
        }),

      gstNumber: yup.string().when("$exist", {
        is: (exist) => exist,
        then: yup
          .string()
          .trim()
          .matches(
            /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}Z[0-9a-zA-Z]{1}$/,
            "Invalid GST Number"
          ),
      }),
      billing: yup.object({
        address: yup.string().required(),
        city: yup.string().required(),
        state: yup.string().required(),
        stateCode: yup.string(),
        country: yup.string().required(),
        pinCode: yup.string().required(),
      }),
      shipping: yup.object({
        address: yup.string().required(),
        city: yup.string().required(),
        state: yup.string().required(),
        stateCode: yup.string(),
        country: yup.string().required(),
        pinCode: yup.string().required(),
      }),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  // Check duplication client via Name

  let ExistingClient = null;
  try {
    ExistingClient = await ClientModel.findOne({
      $or: [{ name: FormData.name }, { email: FormData.email }],
    });
  } catch (err) {
    Logger.error(LoggerLabel, `Client Duplicate Check Error: ${err.message}`);
  }

  if (ExistingClient && req.params.id !== ExistingClient.id) {
    const errors = [];

    if (ExistingClient.name === FormData.name) {
      errors.push({
        name: "name",
        errors: ["Duplicate client, Name already in use."],
      });
    }

    if (ExistingClient.email === FormData.email) {
      errors.push({
        name: "email",
        errors: ["Duplicate client, Email already in use."],
      });
    }

    return requestFailWithError(res, errors);
  }

  // update entry who is updating the field
  FormData.updatedBy = req.user.id;

  try {
    updateResult = await ClientModel.updateOne(
      { id: req.params.id, status: { $ne: "deleted" } },
      { $set: FormData }
    );
  } catch (err) {
    Logger.error(ll, `client Update Error: ${err.message}`);
  }

  if (updateResult.matchedCount > 0) {
    return requestSuccess(res, "client updated successfully");
  } else {
    return requestFail(res, "Unable to update client");
  }
}

async function updateStatus(req, res) {
  if (!req.params.id) return requestFail(res);
  // Step 1: Prepare variables, Validate Request and important fields
  // ----------------------------------------------------------------
  const ACTION_TO_MESSAGE = {
    active: "Client status has been changed. Client is active now.",
    inactive: "Client status has been changed. Client is inactive now.",
  };

  const FormData = req.getValidatedBody(
    yup.object().shape({
      status: yup.string().oneOf(["active", "inactive"]).required(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  FormData.updatedBy = req.user.id;

  let dbRecord = null;

  try {
    dbRecord = await ClientModel.findOne({ id: req.params.id });
  } catch (error) {
    Logger.error(ll, `Client not found error: ${err.message}`);
  }

  if (!dbRecord) return requestFail(res);

  let createClientStatusHistory = null;

  try {
    createClientStatusHistory = await new StatusHistoryModel({
      parentId: req.params.id,
      previous: dbRecord.status,
      current: FormData.status,
      createdBy: req.user.id,
    }).save({ session });
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while creating status history. Error: ${err.message}`
    );
  }

  if (!createClientStatusHistory) {
    await session.abortTransaction();
    await session.endSession();
    return requestFail(
      res,
      "Something went wrong. Failed to change client status."
    );
  }

  let clientStatusUpdateResult = null;

  try {
    clientStatusUpdateResult = await ClientModel.updateOne(
      { id: req.params.id },
      { $set: FormData }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while updating the client status. Error: ${err.message}`
    );
  }

  if (clientStatusUpdateResult.modifiedCount) {
    await session.commitTransaction();
    await session.endSession();
    return requestSuccess(res, ACTION_TO_MESSAGE[FormData.status]);
  }

  await session.abortTransaction();
  await session.endSession();

  return requestFail(
    res,
    "Something went wrong. Failed to change client status."
  );
}

module.exports = {
  list,
  get,
  create,
  update,
  updateStatus,
};
