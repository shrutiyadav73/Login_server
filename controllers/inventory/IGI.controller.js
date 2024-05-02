const {
  requestSuccess,
  requestFail,
  requestFailWithError,
} = require("../../helpers/RequestResponse.helper");

const {
  IGIModel,
  PurchaseOrderModel,
  ReceiveModel,
  RequestModel,
  StockModel,
  StockHistoryModel,
} = require("../../models");
const { paramProxy, generateId } = require("../../helpers/Common.helper");
const mongoose = require("mongoose");
const Logger = require("../../helpers/Logger.helper");
const ll = "IGI Controller";
const { addStock } = require("./Stock.controller");
const {
  INVENTORY_IGI_ACTION,
  INVENTORY_IGI_SAVED,
} = require("../../constant/Event.constant");

async function list(req, res) {
  if (req.query.listType == "pending_igi") {
    return requestSuccess(res, await getList({ status: "pending" }));
  }
  return requestSuccess(res, await getList());
}

async function getList(query = {}) {
  return await IGIModel.find({ status: { $ne: "deleted" }, ...query }, [
    "-_id",
    "-__v",
  ]);
}

async function get(req, res) {
  const query = await paramProxy(req.query);

  // Verify request contained a igi id
  if (!req.params.id) {
    return requestFail(res, "Invalid igi id");
  }

  // Fetch igi detail form database
  const list = await IGIModel.findOne(
    { status: { $ne: "deleted" }, id: req.params.id },
    ["-_id", "-__v"]
  );

  // Check we got some result form the database or not
  // if get some result form database the send back to client
  if (list) {
    return requestSuccess(res, list);
  }

  // fail request if nothing worked
  return requestFail(res, "Can not find igi");
}

async function save(req, res) {
  // Verify request contained a IGI id
  if (!req.params.id) {
    return requestFail(res, "Invalid IGI id");
  }

  const FormInputs = req.body;

  // update entry who is updating the field
  FormInputs.updatedBy = req.user.id;

  const result = await IGIModel.updateOne(
    { id: req.params.id },
    { $set: { ...FormInputs } }
  );

  if (result.modifiedCount == 1) {
    EventBus.emit(
      INVENTORY_IGI_SAVED,
      await IGIModel.findOne({ id: req.params.id })
    );

    return requestSuccess(res);
  } else {
    return requestFail(res, "Can't update IGI module");
  }
}

async function action(req, res) {
  const FormData = req.getValidatedBody(
    yup.object({
      action: yup.string().oneOf(["invert_into_inventory"]).required(),
    })
  );

  if (req.isValidationFailed()) {
    return requestFailWithError(res, req.getValidationErrors());
  }

  if (FormData.action === "invert_into_inventory") {
    return invertIntoInventory(req, res);
  }
}

async function invertIntoInventory(req, res) {
  const igi = await IGIModel.findOne({ id: req.params.id });
  const po = await PurchaseOrderModel.findOne({ id: igi.poId });
  const pr = await RequestModel.findOne({ id: po.prId });

  if (!igi || !po) return requestFail(res, "Something unexpected happened.");

  const session = await mongoose.connection.startSession();
  session.startTransaction({ retryWrites: true });

  // Update the status of Purchase Receive
  try {
    await ReceiveModel.updateOne(
      { id: igi.purchaseReceiveId },
      { $set: { status: "inverted_into_inventory" } },
      { session }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while updating the status of purchase receive. Error: ${err.message}`
    );
    await session.abortTransaction();
    return requestFail(res, "Unable to Invert into inventory");
  }

  // Update the purchase order items
  const poItems = po.items;
  igi.items.forEach((igiItem) => {
    poItems.forEach((poItem, poIndex) => {
      if (igiItem.ipn === poItem.ipn) {
        poItems[poIndex].invertedQuantity =
          parseInt(poItem.invertedQuantity ?? "0") +
          parseInt(igiItem.acceptedQty);
      }
    });
  });

  const poUpdatedDetails = {
    items: poItems,
  };

  let isOrderCompleted = 0;

  poItems.forEach((i) => {
    if (i.quantity <= i.invertedQuantity) return isOrderCompleted++;
  });

  isOrderCompleted = poItems.length == isOrderCompleted;

  if (isOrderCompleted) poUpdatedDetails.status = "completed";

  try {
    await PurchaseOrderModel.updateOne(
      { id: po.id },
      { $set: poUpdatedDetails },
      {
        session,
      }
    );
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while updating purchase order. Error: ${err.message}`
    );
    await session.abortTransaction();
    return requestFail(res, "Unable to invert into inventory");
  }

  // Invert the quantity in the stock
  const warehouseId = pr.deliverTo;
  let successStockCount = 0;

  for (let index = 0; index < igi.items.length; index++) {
    const i = igi.items[index];
    let StockEntry = null;
    let currentStock = 0;
    let stock = i.acceptedQty,
      ipn = i.ipn;
    try {
      StockEntry = await StockModel.findOne({
        ipn,
        warehouseId,
      });
      if (StockEntry) currentStock = parseInt(StockEntry.stock);
    } catch (err) {
      currentStock = 0;
    }

    let tempStock = currentStock + parseInt(stock);

    if (StockEntry) {
      await StockModel.updateOne(
        { id: StockEntry.id },
        {
          $set: {
            stock: tempStock,
          },
        }
      );
    } else {
      let StockForm = {};
      // generate a unique id for stock
      const id = `STO${generateId(5)}`;
      // add missing detail in the stock object
      StockForm.id = id;
      StockForm.ipn = ipn;
      StockForm.warehouseId = warehouseId;
      StockForm.status = "active";
      StockForm.stock = tempStock;
      StockForm.createdBy = req.user.id;
      StockForm.updatedBy = req.user.id;
      try {
        await new StockModel(StockForm).save({ session });
      } catch (err) {
        Logger.error(
          ll,
          `Error occurred while adding stock. Error: ${err.message}`
        );
        break;
      }
    }

    // Now try to create a new stock
    try {
      await new StockHistoryModel({
        id: `STOH${generateId(5)}`,
        ipn,
        warehouseId,
        stock,
        balanceStock: tempStock,
        type: "credit",
        mode: "igi",
        createdBy: req.user.id,
        updatedBy: req.user.id,
      }).save({ session });
    } catch (err) {
      Logger.error(
        ll,
        `Error occurred while adding stock history. Error: ${err.message}`
      );
      break;
    }

    successStockCount++;
  }

  if (successStockCount !== igi.items.length) {
    await session.abortTransaction();
    await session.endSession();
    return requestFail(res, "Expected happened");
  }

  // update the status of IGI
  try {
    await IGIModel.updateOne(
      { id: req.params.id },
      { $set: { status: "inverted_into_inventory" } }
    );
  } catch (error) {
    Logger.error(
      ll,
      `Error occurred while updating IGI status. Error: ${err.message}`
    );
    await session.abortTransaction();
    await session.endSession();
    return requestFail(res, "Expected error happened");
  }

  try {
    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    return requestFail(res, "Something unexpected happened");
  }

  EventBus.emit(INVENTORY_IGI_ACTION, igi);
  requestSuccess(res);
}

module.exports = {
  list,
  get,
  save,
  action,
};
