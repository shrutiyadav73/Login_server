const { getAdmin } = require("../helpers/Common.helper");
const {
  requestSuccess,
  requestFail,
} = require("../helpers/RequestResponse.helper");
const {
  RequestModel,
  PurchaseOrderModel,
  InvoiceModel,
  ItemModel,
  OrderModel,
  ReceiveModel,
} = require("../models");
const pipeline = require("../database/pipelines/purchase/Order.pipeline");

async function myApprovalBucket(req, res) {
  let myApprovalBucket = [],
    tempPurchaseRequestBucket = [],
    tempPurchaseOrderBucket = [],
    tempPurchaseInvoiceBucket = [];

  const admin = await getAdmin();

  try {
    tempPurchaseRequestBucket = await RequestModel.find({
      status: "pending",
      prApprover: admin.id,
    });
    tempPurchaseOrderBucket = await PurchaseOrderModel.aggregate(
      pipeline({
        status: "pending",
        poApprover: admin.id,
      })
    );
    tempPurchaseInvoiceBucket = await InvoiceModel.find({
      status: "pending",
      invoiceApprover: admin.id,
    });
  } catch (err) {
    print(err.message);
  }

  if (tempPurchaseRequestBucket)
    tempPurchaseRequestBucket.forEach((item) => {
      myApprovalBucket.push({
        id: item.id,
        type: "purchase_request",
        amount: item.totalPrice,
        date: item.createdOn,
      });
    });

  if (tempPurchaseOrderBucket)
    tempPurchaseOrderBucket.forEach((item) => {
      myApprovalBucket.push({
        id: item.id,
        type: "purchase_order",
        amount: item?.pr?.totalPrice,
        date: item.createdOn,
      });
    });

  if (tempPurchaseInvoiceBucket)
    tempPurchaseInvoiceBucket.forEach((item) => {
      myApprovalBucket.push({
        id: item.id,
        type: "purchase_invoice",
        amount: item.totalAmount,
        date: item.createdOn,
      });
    });

  if (myApprovalBucket && myApprovalBucket.length > 0)
    return requestSuccess(res, myApprovalBucket);

  return requestFail(res, "Empty approval bucket");
}

async function purchaseStatusReport(req, res) {
  let tempPurchaseStatus = [];
  let data = null;

  try {
    data = await RequestModel.find({ status: "pending" });
    tempPurchaseStatus.push({
      key: "PR Approval Pending",
      value: data.length,
    });
  } catch (err) {}

  try {
    data = await RequestModel.find({ status: "approved" });
    tempPurchaseStatus.push({
      key: "PO Generation Pending",
      value: data.length,
    });
  } catch (err) {}

  try {
    data = await PurchaseOrderModel.find({ status: "pending" });
    tempPurchaseStatus.push({
      key: "PO Approval Pending",
      value: data.length,
    });
  } catch (err) {}

  try {
    data = await PurchaseOrderModel.find({ status: "approved" });
    tempPurchaseStatus.push({
      key: "Invoice Generation Pending",
      value: data.length,
    });
  } catch (err) {}

  try {
    data = await InvoiceModel.find({ status: "pending" });
    tempPurchaseStatus.push({
      key: "Invoice Approval Pending",
      value: data.length,
    });
  } catch (err) {}

  requestSuccess(res, tempPurchaseStatus);
}

async function itemStatusReport(req, res) {
  let tempItemStatusReport = [];

  let data = null;
  try {
    data = await ItemModel.find({ status: { $ne: "deleted" } });

    let tempTotalLowItem = 0;

    data.forEach((item) => {
      let currentStock = 0,
        minStock = 0;
      item.warehouses.forEach((warehouse) => {
        let tempCurrentStock = warehouse.currentStock ?? "0";
        let tempMinStock = warehouse.minStock ?? "0";
        tempCurrentStock =
          typeof parseInt(tempCurrentStock) == "number"
            ? parseInt(tempCurrentStock)
            : 0;

        tempMinStock =
          typeof parseInt(tempMinStock) == "number"
            ? parseInt(tempMinStock)
            : 0;

        currentStock += tempCurrentStock;
        minStock += tempMinStock;
      });

      if (currentStock < minStock) tempTotalLowItem++;
    });

    tempItemStatusReport.push({
      key: "Low Stock Items",
      value: tempTotalLowItem,
    });
  } catch (err) {
    print(err.message);
  }

  try {
    tempItemStatusReport.push({
      key: "Ordered Items",
      value: 0,
    });
  } catch (err) {}

  try {
    tempItemStatusReport.push({
      key: "Receiving Due Items",
      value: 0,
    });
  } catch (err) {}

  requestSuccess(res, tempItemStatusReport);
}

async function salesReport(req, res) {
  let tempSalesReport = {
    lastMonthSale: 0,
    currentMonthSale: 0,
    dailySale: [],
  };

  let data = null;

  let tempDateObj = new Date(),
    month = tempDateObj.getMonth(),
    year = tempDateObj.getFullYear();

  month++;

  try {
    data = await OrderModel.find({
      createdOn: {
        $gte: new Date(
          `${year}-${month.toString().padStart(2, "0")}-01T07:35:30.017+00:00`
        ),
      },
      status: "delivered",
    });

    if (data) {
      data.forEach((item) => {
        tempSalesReport.currentMonthSale += item.total ?? 0;
        tempSalesReport.dailySale[new Date(item.updatedOn).getDate()] =
          tempSalesReport.dailySale[new Date(item.updatedOn).getDate()]
            ? tempSalesReport.dailySale[new Date(item.updatedOn).getDate()] +
                item.total ?? 0
            : item.total ?? 0;
      });
    }
  } catch (err) {
    print(err.message);
  }

  if (tempSalesReport.dailySale.length > 0) {
    for (let i = 0; i < tempSalesReport.dailySale.length; i++) {
      if (tempSalesReport.dailySale[i] === (null || undefined)) {
        tempSalesReport.dailySale[i] = 0;
      }
    }
  }

  try {
    data = await OrderModel.find({
      createdOn: {
        $gte: new Date(
          `${month - 1 == 0 ? --year : year}-${(month - 1 == 0 ? 12 : month - 1)
            .toString()
            .padStart(2, "0")}-01T07:35:30.017+00:00`
        ),
        $lt: new Date(
          `${year}-${month.toString().padStart(2, "0")}-01T07:35:30.017+00:00`
        ),
      },
      status: "delivered",
    });

    data.forEach((item) => {
      tempSalesReport.lastMonthSale += item.total ?? 0;
    });
  } catch (err) {
    print(err.message);
  }

  requestSuccess(res, tempSalesReport);
}

async function purchaseReport(req, res) {
  let tempPurchaseReport = {
    lastMonthPurchase: 0,
    currentMonthPurchase: 0,
    dailyPurchase: [],
  };

  let data = null;

  let tempDateObj = new Date(),
    month = tempDateObj.getMonth(),
    year = tempDateObj.getFullYear();

  month++;

  try {
    data = await ReceiveModel.find({
      receiveDate: {
        $gte: new Date(
          `${year}-${month.toString().padStart(2, "0")}-01T07:35:30.017+00:00`
        ),
      },
    });

    if (data) {
      data.forEach((item) => {
        tempPurchaseReport.currentMonthPurchase +=
          parseInt(item.paidAmount) ?? 0;
        tempPurchaseReport.dailyPurchase[new Date(item.updatedOn).getDate()] =
          tempPurchaseReport.dailyPurchase[new Date(item.updatedOn).getDate()]
            ? tempPurchaseReport.dailyPurchase[
                new Date(item.updatedOn).getDate()
              ] + parseInt(item.paidAmount) ?? 0
            : parseInt(item.paidAmount) ?? 0;
      });
    }
  } catch (err) {
    print(err.message);
  }

  if (tempPurchaseReport.dailyPurchase.length > 0) {
    for (let i = 0; i < tempPurchaseReport.dailyPurchase.length; i++) {
      if (tempPurchaseReport.dailyPurchase[i] === (null || undefined)) {
        tempPurchaseReport.dailyPurchase[i] = 0;
      }
    }
  }

  try {
    data = await ReceiveModel.find({
      receiveDate: {
        $gte: new Date(
          `${month - 1 == 0 ? --year : year}-${(month - 1 == 0 ? 12 : month - 1)
            .toString()
            .padStart(2, "0")}-01T07:35:30.017+00:00`
        ),
        $lt: new Date(
          `${year}-${month.toString().padStart(2, "0")}-01T07:35:30.017+00:00`
        ),
      },
    });

    data.forEach((item) => {
      tempPurchaseReport.lastMonthPurchase += parseInt(item.paidAmount ?? "0");
    });
  } catch (err) {
    print(err.message);
  }

  requestSuccess(res, tempPurchaseReport);
}

module.exports = {
  myApprovalBucket,
  purchaseStatusReport,
  itemStatusReport,
  salesReport,
  purchaseReport,
};
