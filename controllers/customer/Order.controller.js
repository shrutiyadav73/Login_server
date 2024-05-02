const { object, string } = require("yup");
const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");

var bcrypt = require("bcryptjs");
const { OrderModel } = require("../../models");
const {
  generateId,
  paramProxy,
  getCurrentUser,
} = require("../../helpers/Common.helper");
const listPipeline = require("../../database/pipelines/customer/Order.pipeline");

async function list(req, res) {
  const pipeline = listPipeline(await paramProxy(req.query));
  const list = await OrderModel.aggregate(pipeline);
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any order in your account");
}

async function get(req, res) {
  // Verify request contained a customer id
  if (!req.params.id) {
    return requestFail(res, "Invalid order id");
  }

  // Fetch customer detail form database
  const pipeline = listPipeline({
    ...(await paramProxy(req.query)),
    id: req.params.id,
  });
  const list = await OrderModel.aggregate(pipeline);
  if (list && list.length > 0) {
    return requestSuccess(res, list[0]);
  }

  // fail request if nothing worked
  return requestFail(res, "Order not found");
}

async function create(req, res) {
  // Get data and verify as per need
  let orderForm = req.body;

  if (!orderForm.customerId) {
    return requestFail(res, "Can't place an anonymous order");
  }

  // generate a unique id for customer
  const id = `CO${generateId(14)}`;

  // add missing detail in the customer object
  orderForm.id = id;
  orderForm.createdBy = orderForm.customerId;
  orderForm.updatedBy = orderForm.customerId;
  orderForm.status = "placed";

  // Now try to create a new customer
  try {
    let data = await new OrderModel(orderForm).save();
    return requestSuccess(res, data);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Unable to place order.");
}

async function update(req, res) {
  // Verify request containe a customer id
  if (!req.params.id) {
    return requestFail(res, "Invalid order id");
  }

  // store all request data into customer var
  let orderForm = req.body,
    ADMIN = await getCurrentUser();

  // update entry who is updateing the field
  orderForm.updatedBy = ADMIN.id;

  delete orderForm?.id;

  OrderModel.updateOne(
    { id: req.params.id },
    { $set: { ...orderForm } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't update order now");
      }
    }
  );
}

async function cancel(req, res) {
  if (!req.params.id) {
    return requestFail(res, "Invalid customer id");
  }

  // store all request data into customer var
  let orderCancelForm = req.body;

  // update entry who is updating the field
  orderCancelForm.updatedBy = req.params.id;
  orderCancelForm.status = "canceled";

  OrderModel.updateOne(
    { id: req.params.id },
    { $set: { ...orderCancelForm } },
    (error, result) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Can't not cancel order now");
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
    customer = await OrderModel.findOne({ id: reqData.id });
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
    OrderModel.updateOne(
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
  // Verify request contained a customer id
  if (!req.params.id) {
    return requestFail(res, "Invalid customer id");
  }

  try {
    await OrderModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: req.user.id } }
    );
    return requestSuccess(res, "customer deleted successfully");
  } catch (error) {
    return requestFail(res, "Can't delete customer now");
  }
}

async function statusReport(req, res) {
  let tempOrderList = [];

  let tempOrderStatusReport = {
    packed: 0,
    shipped: 0,
    delivered: 0,
    invoiced: 0,
  };

  try {
    tempOrderList = await OrderModel.find();
  } catch (err) {
    print(err.message);
  }

  if (tempOrderList && tempOrderList.length > 0)
    tempOrderList.forEach((item) => {
      try {
        tempOrderStatusReport[item.status] += 1;
      } catch (err) {
        print(err.message);
      }
    });

  requestSuccess(res, tempOrderStatusReport);
}

module.exports = {
  list,
  get,
  create,
  update,
  changePassword,
  delete: remove,
  cancel,
  statusReport,
};
