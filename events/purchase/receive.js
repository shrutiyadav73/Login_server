const { INVENTORY_IGI_SAVED } = require("../../constant/Event.constant");
const Logger = require("../../helpers/Logger.helper");
const ll = "Purchase Receive EH";
const { ReceiveModel } = require("../../models");

EventBus.on(INVENTORY_IGI_SAVED, async (data) => {
  Logger.debug(ll, "Event Occurred of IGI saved");
  Logger.silly(ll, JSON.stringify(data));

  if (data.status === "in_progress") {
    try {
    await ReceiveModel.updateOne(
        { id: data.purchaseReceiveId },
        {
          $set: {
            status: "inspection_started",
          },
        }
      );

    } catch (error) {
      Logger.error(
        ll,
        `Error occurred while updating receive status to inspection_started. Error: ${err.message}`
      );
    }
  }

  if (data.status === "inspection_completed") {
    try {
     await ReceiveModel.updateOne(
        { id: data.purchaseReceiveId },
        {
          $set: {
            status: "inspection_completed",
          },
        }
      );
    } catch (error) {
      Logger.error(
        ll,
        `Error occurred while updating receive status to inspection_completed. Error: ${err.message}`
      );
    }
  }
});
