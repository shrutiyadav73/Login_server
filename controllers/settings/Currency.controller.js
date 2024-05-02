const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const { CurrencyModel } = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");

async function list(req, res) {
  const list = await CurrencyModel.find(
    { status: { $ne: "deleted" }, ...req.query },
    ["-_id", "-__v"]
  );
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any currency");
}

async function get(req, res) {
  // Verify request containe a currency id
  if (!req.params.id) {
    return requestFail(res, "Invalid currency id");
  }

  // Fetch currency detail form database
  const list = await CurrencyModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can't find currency");
}

async function create(req, res) {


  // Get data and verify as per need
  let currency = req.body;

  if (!currency.name) {
    return requestFail(res, "currency name is required");
  }

  if (await CurrencyModel.findOne({ name: currency.name })) {
    return requestFail(res, "Duplicate currency name");
  }

  // generate a unique id for currency
  const id = `CUR${generateId(5)}`;

  // add missing detail in the currency object
  currency.id = id;
  currency.status = "active";
  currency.createdBy = req.user.id;
  currency.updatedBy = req.user.id;

  // Now try to create a new currency
  try {
    await new CurrencyModel(currency).save();
    return requestSuccess(res);
  } catch (error) {
    print(error);
  }

  return requestFail(res, "Something went wrong, Can't create currency now.");
}

async function update(req, res) {
  // Verify request containe a currency id
  if (!req.params.id) {
    return requestFail(res, "Invalid currency id");
  }

  let FormData = req.body;
   
  FormData.updatedBy = req.user.id;

  // if (FormData.id && req.params.id != FormData.id)
  //   return requestFail(res, "Something went wrong, Can't update currency");

  delete FormData.id;

  // find currency as per name
  let dbRecord = await CurrencyModel.findOne({
    name: FormData.name,
  });

  if (dbRecord) {
    if (dbRecord.id != req.params.id)
      return requestFail(res, "currency already in use");
  }


  const updateResult = await CurrencyModel.updateOne(
    { id: req.params.id , status:{$ne:'deleted'}},
    { $set: FormData  },

    
  );

  if (updateResult.matchedCount) {
    return requestSuccess(res, "currency updated successfully");
  } else {
    return requestFail(res, "Unable to update currency");
  } 

}

async function remove(req, res) {
  // Verify request containe a currency id
  if (!req.params.id) {
    return requestFail(res, "Invalid currency id");
  }

 
   const updateResult = await CurrencyModel.updateOne(
      { id: req.params.id },
      { $set: { status: "deleted", updatedBy: req.user.id } }
    );

    if (updateResult.matchedCount) {
      return requestSuccess(res, "currency deleted successfully");
    } else {
      return requestFail(res, "Unable to delete currency");
    }
}

module.exports = {
  list,
  get,
  create,
  update,
  delete: remove,
};
