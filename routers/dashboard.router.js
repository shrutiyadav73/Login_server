const express = require("express");
const router = express.Router();

const OrderController = require("../controllers/customer/Order.controller");
const DashboardController = require("../controllers/Dashboard.controller");
const ItemController = require("../controllers/inventory/Item.controller");

// POST METHOD
router.get("/order/status", OrderController.statusReport);
router.get("/item/status", DashboardController.itemStatusReport);
router.get("/purchase/status", DashboardController.purchaseStatusReport);
router.get("/my-approval-bucket", DashboardController.myApprovalBucket);
router.get("/sales-report", DashboardController.salesReport);
router.get("/purchase-report", DashboardController.purchaseReport);

module.exports = router;
