const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");

const { CartModel } = require("../../models");

async function get(req, res) {
  if (!req.params.id) {
    return requestFail(res, "Something went wrong");
  }

  // Fetch customer detail form database
  const cart = await CartModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  if (cart) {
    return requestSuccess(res, cart);
  } else {
    return requestSuccess(res, {
      customerId: req.params.id,
      totalItems: 0,
      activeStep: 0,
      shippingAddress: null,
      billingAddress: null,
      total: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      products: [],
      paymentMode: "",
    });
  }
}

async function update(req, res) {
  if (!req.params.id) {
    return requestFail(res, "Something went wrong");
  }

  // store all request data into customer var
  let cartObj = req.body;

  delete cartObj.customerId;

  CartModel.updateOne(
    { customerId: req.params.id },
    { $set: { ...cartObj } },
    (error) => {
      if (!error) {
        return requestSuccess(res);
      } else {
        return requestFail(res, "Fail to update user cart");
      }
    }
  );
}

module.exports = {
  get,
  update,
};
