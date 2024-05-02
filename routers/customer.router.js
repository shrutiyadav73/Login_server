const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/customer/Profile.controller");
const CartController = require("../controllers/customer/Cart.controller");
const OrderController = require("../controllers/customer/Order.controller");

router.put("/profile/change-password", ProfileController.changePassword);
router.get("/profile/:id", ProfileController.get);
router.put("/profile/:id", ProfileController.update);
router.get("/profile", ProfileController.list);

router.get("/cart/:id", CartController.get);
router.put("/cart/:id", CartController.update);

router.put("/order/:id/cancel", OrderController.cancel);
router.put("/order/:id/update", OrderController.update);
router.get("/order", OrderController.list);
router.get("/order/:id", OrderController.get);
router.post("/order", OrderController.create);

module.exports = router;
