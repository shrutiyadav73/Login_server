const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { EmailModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");

async function list(req, res) {
  const list = await EmailModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any email");
}

async function get(req, res) {
  // Verify request containe a email id
  if (!req.params.id) {
    return requestFail(res, "Invalid email id");
  }

  // Fetch email detail form database
  const list = await EmailModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find email");
}

async function create(req, res) {

  let emailForm = req.body;

  if (!emailForm.email) {
    return requestFail(res, "email  is required");
  }

  if (await EmailModel.findOne({ email: emailForm.email })) {
    return requestFail(res, "Duplicate email name");
  }

  // generate a unique id for email
  const id = `EM${generateId(5)}`;

  // add missing detail in the email object
  emailForm.id = id;
  emailForm.status = "active";
  emailForm.createdBy = req.user.id;
  emailForm.updatedBy = req.user.id;

  // Now try to create a new email
  try {
    await new EmailModel(emailForm).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create email now.");
}

async function update(req, res) {
  // Verify request containe a email id
  if (!req.params.id) {
    return requestFail(res, "Invalid email id");
  }

  let FormData = req.body;

  FormData.updatedBy = req.user.id;

  delete FormData.id;

  let dbRecord = await EmailModel.findOne({
    email: FormData.email,
  });

  if (dbRecord && dbRecord.id != req.params.id)
  return requestFail(res, "Email already in use");


  const updateResult = await EmailModel.updateOne(
    { id: req.params.id, status:{$ne:'deleted'}},
    { $set: FormData }
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "email updated successfully");
  } else {
    return requestFail(res, "Unable to update email");
  }
}

async function remove(req, res) {
  // Verify request containe a email id
  if (!req.params.id) {
    return requestFail(res, "Invalid email id");
  }

  const updateResult =  await EmailModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: req.user.id } }
    );

   if (updateResult.matchedCount) {
    return requestSuccess(res, "email deleted successfully");
  } else {
    return requestFail(res, "Unable to delete email");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
