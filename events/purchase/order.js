const { connection } = require("mongoose");
const {
  PURCHASE_RECEIVE_CREATED,
  PO_VERIFIED,
} = require("../../constant/Event.constant");
const Logger = require("../../helpers/Logger.helper");
const { PurchaseOrderModel } = require("../../models");
const ll = "EH | Purchase Order";

EventBus.on(PURCHASE_RECEIVE_CREATED, async (data) => {
  const updateResult = await PurchaseOrderModel.updateOne(
    { id: data.purchaseOrderId },
    { $set: { status: "po_received" } }
  );

  if (updateResult.modifiedCount) {
    Logger.info(ll, `Purchase Order status updated on purchase received event`);
  } else {
    Logger.error(
      ll,
      `Failed to update Purchase Order status on purchase received event`
    );
  }
});

EventBus.on(PO_VERIFIED, async (data) => {
  const session = await connection.startSession();
  session.endSession();
});
