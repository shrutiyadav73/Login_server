const {
  PURCHASE_RECEIVE_ACTION,
  INVENTORY_IGI_CREATED,
} = require("../../constant/Event.constant");
const { generateNextSerialId } = require("../../helpers/Common.helper");
const Logger = require("../../helpers/Logger.helper");
const { PurchaseOrderModel, IGIModel } = require("../../models");
const ll = "IGI Event Handler";

//----------------------------------------------------------------------------
// Purchase receive action performed. Create igi if action is send_to_igi
//----------------------------------------------------------------------------
EventBus.on(PURCHASE_RECEIVE_ACTION, async (data) => {
  let poId = data.purchaseOrderId ?? null;
  let purchaseReceiveId = data.id;

  if (data.status !== "send_to_igi") return;

  if (!poId)
    return Logger.error(
      ll,
      "IGI event handle terminated duo to missing `poId` in event data."
    );

  // Fetch Purchase Order details
  let po = null;

  try {
    po = await PurchaseOrderModel.findOne({ id: poId });
  } catch (err) {
    Logger.error(ll, `Error occurred while fetching PO. Error: ${err.message}`);
  }

  if (!po)
    return Logger.error(
      ll,
      "IGI event handle terminated duo to missing `po` details"
    );

  const id = await generateNextSerialId(IGIModel, "IGI");

  let totalQty = 0;
  const igiPayload = {
    id,
    poId,
    purchaseReceiveId,
    items: po.items.map((i) => {
      totalQty += parseInt(i.quantity);
      return {
        ipn: i.ipn,
        shortDescription: i.description,
        expectedQty: i.quantity,
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
      };
    }),
    totalQty,
    status: "pending",
    createdBy: "system",
    updatedBy: "system",
  };

  let igiCreateRes = null;

  try {
    igiCreateRes = await new IGIModel(igiPayload).save();
  } catch (err) {
    Logger.error(
      ll,
      `Error occurred while creating IGI. Error: ${err.message}`
    );
  }

  if (igiCreateRes) {
    Logger.info(ll, "IGI created successfully");
    EventBus.emit(INVENTORY_IGI_CREATED, igiCreateRes);
  } else {
    Logger.error(ll, "IGI event handle terminated duo to missing `po` details");
  }
});
