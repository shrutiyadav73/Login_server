const { object, string } = require("yup");
const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
var bcrypt = require("bcryptjs");
const { CustomerModel } = require("../../models");
const { generateId, getAdmin, getCurrentUser } = require("../../helpers/Common.helper");

async function list(req, res) {
  const list = await CustomerModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any customer");
}

async function get(req, res) {
  // Verify request containe a customer id
  if (!req.params.id) {
    return requestFail(res, "Invalid customer id");
  }

  // Fetch customer detail form database
  const list = await CustomerModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find customer");
}

async function create(req, res) {
  // get current user

  // Get data and verify as per need
  let customer = req.body;

  if (!customer.name) {
    return requestFail(res, "customer name is required");
  }

  if (await CustomerModel.findOne({ name: customer.name })) {
    return requestFail(res, "Duplicate customer name");
  }

  // generate a unique id for customer
  const id = `P${generateId(5)}`;

  // add missing detail in the customer object
  customer.id = id;
  customer.status = "active";

  // Now try to create a new customer
  try {
    await new CustomerModel(customer).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create customer now.");
}

async function update(req, res) {
  // Verify request containe a customer id
  if (!req.params.id) {
    return requestFail(res, "Invalid customer id");
  }

  // store all request data into customer var
  let customer = req.body,
    ADMIN = await getCurrentUser();

  // update entry who is updateing the field
  customer.updatedBy = ADMIN.id;
 
  if (customer.id && req.params.id != customer.id)
    return requestFail(res, "Something went wrong, Can't update customer");

  delete customer.id;

  // find customer as per name
  let dbcustomer = await CustomerModel.findOne({
    email: customer.email,
  });

  if (dbcustomer) {
    if (dbcustomer.id != req.params.id)
      return requestFail(res, "customer already in use");
  }

  CustomerModel.updateOne(
    { id: req.params.id },
    { $set: { ...customer } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't update customer now");
      }
    }
  );
}

async function changePassword(req, res) {
  const LoginSchema = object({
    id: string().required("Something want wrong"),
    password: string().required("Enter your current password"),
    newPassword: string().required("Please enter an new password"),
  });
  let reqData = null;

  try {
    reqData = await LoginSchema.validate(req.body);
  } catch (e) {
    return requestFail(res, e.message);
  }

  let customer = null;

  try {
    customer = await CustomerModel.findOne({ id: reqData.id });
  } catch (error) {}

  if (!customer) return requestFail(res, "Something went wrong");

  const isPasswordMatch = await bcrypt.compare(
    reqData.password,
    customer.password
  );
  if (!isPasswordMatch)
    return requestFail(res, 4004, "Entered wrong Current Password.");

  let encryptedPassword = bcrypt.hashSync(reqData.newPassword, 8);

  try {
    CustomerModel.updateOne(
      { id: reqData.id },
      {
        $set: {
          password: encryptedPassword,
          updatedBy: reqData.id,
        },
      },
      async (error, result) => {
        if (error || result.modifiedCount == 0) {
          return requestFail(res, "Can't change password right now.");
        } else {
          return requestSuccess(res, "Password change successfully.");
        }
      }
    );
  } catch (error) {
    return requestFail(res, "Can't change password now.");
  }
}

async function remove(req, res) {
  // Verify request containe a customer id
  if (!req.params.id) {
    return requestFail(res, "Invalid customer id");
  }

  let ADMIN = await getAdmin();

  try {
    await CustomerModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: ADMIN.id } }
    );
    return requestSuccess(res, "customer deleted successfully");
  } catch (error) {
    return requestFail(res, "Can't delete customer now");
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  changePassword,
  delete: remove,
};
