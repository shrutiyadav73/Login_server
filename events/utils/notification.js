const {
  PURCHASE_RECEIVE_CREATED,
} = require("../../constant/Event.constant");

EventBus.on(PURCHASE_RECEIVE_CREATED, (data) => {
  console.log("Sending notification on purchaser receive with:", data);
});
