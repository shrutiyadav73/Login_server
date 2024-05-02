const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { PolicyModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");

async function list(req, res) {
  const list = await PolicyModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any policy");
}

async function get(req, res) {
  // Verify request containe a policy id
  if (!req.params.id) {
    return requestFail(res, "Invalid policy id");
  }

  // Fetch policy detail form database
  const list = await PolicyModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find policy");
}

async function create(req, res) {
  // get current user


  // Get data and verify as per need
  let policy = req.body;

  if (!policy.name) {
    return requestFail(res, "policy name is required");
  }

  if (await PolicyModel.findOne({ name: policy.name })) {
    return requestFail(res, "Duplicate policy name");
  }

  // generate a unique id for policy
  const id = `P${generateId(5)}`;

  // add missing detail in the policy object
  policy.id = id;
  policy.status = "active";
  policy.createdBy = req.user.id;
  policy.updatedBy = req.user.id;

  // Now try to create a new policy
  try {
    await new PolicyModel(policy).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create policy now.");
}

async function update(req, res) {
  // Verify request containe a policy id
  if (!req.params.id) {
    return requestFail(res, "Invalid policy id");
  }

  let FormData = req.body;
  FormData.updatedBy = req.user.id;
  delete FormData.id;

  // find policy as per name
  let dbRecord = await PolicyModel.findOne({
    name: FormData.name,
  });

  if (dbRecord && dbRecord.id != req.params.id)
    return requestFail(res, "Policy already in use");

  const updateResult = await PolicyModel.updateOne(
    { id: req.params.id, status: { $ne: "deleted" } },
    { $set: FormData }
  );
  if (updateResult.matchedCount) {
    return requestSuccess(res, "Policy updated successfully");
  } else {
    return requestFail(res, "Unable to update Policy");
  }
}

async function remove(req, res) {
  // Verify request containe a policy id
  if (!req.params.id) {
    return requestFail(res, "Invalid policy id");
  }
  const updateResult = await PolicyModel.updateOne(
    { id: req.params.id },
    { $set: { status: "deleted", updatedBy: req.user.id } }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "Policy deleted successfully");
  } else {
    return requestFail(res, "Unable to delete policy");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
