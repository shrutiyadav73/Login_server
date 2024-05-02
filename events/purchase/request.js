const {
  PO_CREATED,
  RFQ_CREATED,
  PO_UPDATED,
} = require("../../constant/Event.constant");
const Logger = require("../../helpers/Logger.helper");
const ll = "EH | Purchaser Request";
const { RequestModel } = require("../../models");

EventBus.on(PO_CREATED, async (data) => {
  Logger.info(ll, "Purchaser Request on event PO_CREATED");

  // Update Purchase Request Items
  const prId = data.prId;

  const pr = await RequestModel.findOne({ id: prId });

  if (!pr)
    return Logger.info(ll, "Invalid Purchaser Request on event PO_CREATED");

  const prItems = pr.items;
  const poItems = data.items;

  // Loop on PO items and update purchase request items

  const updatedPRItems = [];

  prItems.forEach((prItem) => {
    let poItem = poItems.filter((poI) => prItem.ipn === poI.ipn);
    if (poItem?.length > 0) {
      poItem = poItem[0];

      prItem.orderedQuantity =
        parseInt(prItem.orderedQuantity) + parseInt(poItem.quantity);

      updatedPRItems.push(prItem);
    }
  });

  if (updatedPRItems.length > 0) {
    const prUpdateItemsResult = await RequestModel.updateOne(
      { id: prId },
      { $set: { items: updatedPRItems } }
    );

    if (prUpdateItemsResult.modifiedCount > 0) {
      Logger.info(ll, "Purchase request items updated on event PO_CREATED");
    } else {
      Logger.error(
        ll,
        "(1) Unable to update purchase request items on event PO_CREATED"
      );
    }
  } else {
    Logger.error(
      ll,
      "(2) Unable to update purchase request items on event PO_CREATED"
    );
  }
});

EventBus.on(PO_UPDATED, async (data, prePo) => {
  Logger.info(ll, "Purchaser Request on event PO_UPDATED");

  // Update Purchase Request Items
  const prId = data.prId;

  const pr = await RequestModel.findOne({ id: prId });

  if (!pr)
    return Logger.info(ll, "Invalid Purchaser Request on event PO_UPDATED");

  const prItems = pr.items;
  const poItems = data.items;
  const prePoItems = prePo.items;

  // Loop on PO items and update purchase request items

  const updatedPRItems = [];

  prItems.forEach((prItem) => {
    let poItem = poItems.filter((poI) => prItem.ipn === poI.ipn);
    let prePoItem = prePoItems.filter(
      (prePoItem) => prItem.ipn === prePoItem.ipn
    );
    if (poItem?.length > 0) {
      poItem = poItem[0];

      if (prePoItem.length === 1) {
        prItem.orderedQuantity =
          parseInt(prItem.orderedQuantity) -
          parseInt(prePoItem[0].quantity ?? "0");
      }

      prItem.orderedQuantity =
        parseInt(prItem.orderedQuantity) + parseInt(poItem.quantity);

      updatedPRItems.push(prItem);
    }
  });

  if (updatedPRItems.length > 0) {
    const prUpdateItemsResult = await RequestModel.updateOne(
      { id: prId },
      { $set: { items: updatedPRItems } }
    );

    if (prUpdateItemsResult.modifiedCount > 0) {
      Logger.info(ll, "Purchase request items updated on event PO_UPDATED");
    } else {
      Logger.error(
        ll,
        "(1) Unable to update purchase request items on event PO_UPDATED"
      );
    }
  } else {
    Logger.error(
      ll,
      "(2) Unable to update purchase request items on event PO_UPDATED"
    );
  }
});

//----------------------------------------------------------------------------
// RFQ Created started updating status of Purchase Request Item
//----------------------------------------------------------------------------

EventBus.on(RFQ_CREATED, async (data) => {
  Logger.info(
    ll,
    "RFQ Created started updating status of Purchase Request Item"
  );
  let prRequest = null;

  try {
    prRequest = await RequestModel.findOne({ id: data.prRequestId });
  } catch (err) {
    return Logger.error(
      ll,
      `Error ocurred while getting purchase request via id, Error: ${err.message} `
    );
  }

  const prItems = prRequest?.items;
  if (!Array.isArray(prItems)) {
    return Logger.error(
      ll,
      `Purchase request items is not found, Aborting Update status of Purchase Request Items`
    );
  }

  let rfqItems = null;

  try {
    rfqItems = data.items;
  } catch (err) {
    return Logger.error(
      ll,
      `Error ocurred while getting rfq items, Error: ${err.message} `
    );
  }

  try {
    rfqItems.forEach((rfqItem) => {
      prItems.forEach((prItem, index) => {
        if (prItem.ipn === rfqItem.ipn) {
          prItems[index]["status"] = "rfq_generated";
        }
      });
    });
  } catch (err) {
    return Logger.error(
      ll,
      `While attempting to update status of pr items got error. Error:${err.message} `
    );
  }

  // Purchase Request Update Object
  const prUpdateData = {};

  // check, is all pr items status is `rfq_generated`

  let prItemsWithRFQ = prItems.filter(
    (item) => item?.status != "rfq_generated"
  );

  if (!prItemsWithRFQ.length) {
    prUpdateData.rfq_pending = false;
  }

  if (prRequest.status === "approved") {
    prUpdateData.status = "purchase_initiated";
  }

  prUpdateData.items = prItems;

  let updateResult = null;

  try {
    updateResult = await RequestModel.updateOne(
      { id: data.prRequestId },
      {
        $set: prUpdateData,
      }
    );
  } catch (err) {
    return Logger.error(
      ll,
      `Trying to save purchase request changes, error occurred. Error: ${err.message}`
    );
  }

  if (updateResult && updateResult?.modifiedCount > 0) {
    Logger.info(ll, "Purchase Request status updated on event RFQ_CREATED");
  } else {
    Logger.error(
      ll,
      "Unable to update purchase request status on event RFQ_CREATED"
    );
  }
});

async function update(req, res) {
  const FormData = req.getValidatedBody(
    yup.object().shape({
      quotationId: yup.string().required(),
      voucherNumber: yup.string().required(),
      poVerifierId: yup.string().required(),
    })
  );

  if (!req.params.id) {
    return requestFail(res, "Invalid ID supplied");
  }

  const session = await mongoose.connection.startSession();
  session.startTransaction();

  FormData.updatedBy = req.user.id;
  // FormData.status = "in_verification";

  if (FormData.comment) {
    let tempPurchaseOrder = null;

    // Try to get purchase order from Database
    try {
      tempPurchaseOrder = await PurchaseOrderModel.findOne({
        id: req.params.id,
      });
    } catch (error) {
      return requestFail(res, "Error occurred while fetching Purchase Order");
    }

    if (!tempPurchaseOrder) {
      await session.abortTransaction();
      session.endSession();
      return requestFail(res, "Purchase Order not found");
    }

    let tempMessageList = tempPurchaseOrder.messages || [];

    tempMessageList.push({
      id: generatePassword(17),
      user: req.user.id,
      userName: req.user.name,
      message: FormData.comment,
      type: "correction",
      userType: FormData.userType,
      postedAt: new Date().toString(),
    });

    FormData.messages = tempMessageList;
  }

  // Removing ID from FormData because we don't need to update purchase order ID
  delete FormData.id;

  let poUpdateResult;
  try {
    poUpdateResult = await PurchaseOrderModel.updateOne(
      { id: req.params.id },
      { $set: { ...FormData } },
      { session }
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    Logger.error(
      ll,
      `Error occurred while updating purchase order: ${err.message}`
    );
    return requestFail(res, "Failed to update purchase order");
  }

  if (!poUpdateResult?.modifiedCount) {
    await session.abortTransaction();
    session.endSession();
    return requestFail(res, "No changes made to the purchase order");
  }

  // Commit Transaction
  await session.commitTransaction();
  session.endSession();

  // Dispatch Event
  const updatedPO = await PurchaseOrderModel.findOne({ id: req.params.id });
  EventBus.emit(PO_UPDATED, updatedPO);

  return requestSuccess(res, "Purchase order updated successfully");
}
