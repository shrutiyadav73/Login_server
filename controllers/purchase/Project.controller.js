const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { ProjectModel, ClientModel } = require("../../models");
const {
  generateId,
  getAdmin,
  paramProxy,
} = require("../../helpers/Common.helper");
const pipeline = require("../../database/pipelines/setting/Project.pipeline");
const Logger = require("../../helpers/Logger.helper");
const ll = "ProjectController";

async function list(req, res) {
  const query = await paramProxy(req.query);
  const list = await ProjectModel.aggregate(pipeline({ ...query }));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any project");
}

async function get(req, res) {
  // Verify request contained a project id
  if (!req.params.id) {
    return requestFail(res, "Invalid project id");
  }

  // Fetch project detail form database
  const list = await ProjectModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find project");
}

async function create(req, res) {
  // Get data and verify as per need
  let FormData = req.body;

  if (!FormData.name) {
    return requestFail(res, "project name is required");
  }

  if (!FormData.clientId) {
    return requestFail(res, "Client Id is required");
  }

  let client = null;

  Logger.silly(ll, JSON.stringify(await ClientModel.find()));
  Logger.silly(ll, JSON.stringify({ id: FormData.clientId }));

  try {
    client = await ClientModel.findOne({ id: FormData.clientId });
  } catch (err) {
    Logger.error(ll, err);
  }

  Logger.silly(ll, JSON.stringify(client));

  if (!client) {
    return requestFail(res, "Something wrong with client");
  }

  if (await ProjectModel.findOne({ name: FormData.name })) {
    return requestFail(res, "Duplicate project name");
  }

  // generate a unique id for project
  const id = `PRO${generateId(5)}`;

  // add missing detail in the project object
  FormData.id = id;
  FormData.clientId = client.id;
  FormData.status = "active";
  FormData.createdBy = req.user.id;
  FormData.updatedBy = req.user.id;

  // Now try to create a new project
  try {
    await new ProjectModel(FormData).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create project now.");
}

async function update(req, res) {
  // Verify request contained a project id
  if (!req.params.id) {
    return requestFail(res, "Invalid project id");
  }

  // store all request data into project var
  let FormData = req.body;

  FormData.updatedBy = req.user.id;

  delete FormData.id;

  // find project as per name
  let dbRecord = await ProjectModel.findOne({ name: FormData.name });

  if (dbRecord) {
    if (dbRecord.id != req.params.id)
      return requestFail(res, "Project already in use");
  }

  const updateResult = await ProjectModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Project updated successfully");
  } else {
    return requestFail(res, "Unable to update project");
  }
}

async function remove(req, res) {
  // Verify request contained a project id
  if (!req.params.id) {
    return requestFail(res, "Invalid project id");
  }

  const updateResult = await ProjectModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );
  if (updateResult.matchedCount) {
    return requestSuccess(res, "Project deleted successfully");
  } else {
    return requestFail(res, "Unable to delete project");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
