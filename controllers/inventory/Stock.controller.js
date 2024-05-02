const {
  requestSuccess,
  requestFail,
} = require("../../helpers/RequestResponse.helper");
const {
  StockModel,
  WarehouseModel,
  StockAssignModel,
  StockHistoryModel,
} = require("../../models");
const { generateId, getAdmin } = require("../../helpers/Common.helper");
const {
  stockList,
  stockHistoryList,
} = require("../../database/pipelines/inventory/stock.pipeline");

async function list(req, res) {
  const list = await StockModel.aggregate(stockList(req.query));
  if (list && list.length > 0) {
    return requestSuccess(res, list);
  }
  return requestFail(res, "Can't find any stock");
}

async function create(req, res) {
  let StockForm = req.body;
  let warehouse = null;
  let currentStock = null;
  let StockEntry = null;

  let stock = null;

  try {
    stock = await canCreateStock(req.body);
  } catch (error) {
    return requestFail(res, error.message);
  }

  try {
    warehouse = await WarehouseModel.findOne({ id: StockForm.warehouseId });
  } catch (error) {
    console.log(error);
  }

  if (!warehouse)
    return requestFail(res, "Something went wrong with warehouse.");

  try {
    StockEntry = await StockModel.findOne({
      ipn: StockForm.ipn,
      warehouseId: StockForm.warehouseId,
    });
    currentStock = parseInt(StockEntry.stock);
  } catch (err) {
    currentStock = 0;
  }

  let tempStock = currentStock + parseInt(StockForm.stock);

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
    // generate a unique id for stock
    const id = `STO${generateId(5)}`;
    // add missing detail in the stock object
    StockForm.id = id;
    StockForm.warehouse = warehouse.name;
    StockForm.status = "active";
    StockForm.stock = tempStock;
    StockForm.createdBy = req.user.id;
    StockForm.updatedBy = req.user.id;

    try {
      await new StockModel(StockForm).save();
    } catch (err) {}
  }

  // Now try to create a new stock
  try {
    await new StockHistoryModel({
      id: `STOH${generateId(5)}`,
      ipn: StockForm.ipn,
      warehouseId: warehouse.id,
      warehouse: warehouse.name,
      stock: StockForm.stock,
      balanceStock: tempStock,
      type: "credit",
      createdBy: req.user.id,
      updatedBy: req.user.id,
    }).save();

    return requestSuccess(res);
  } catch (error) {
    print(error);
    return requestFail(res, "Request fail due to internal issue.");
  }
}

async function history(req, res) {
  try {
    const { ipn, warehouseId } = req.params;

    if (!ipn || !warehouseId) {
      return requestFail(res, "Invalid IPN or warehouse ID");
    }

    const stockHistory = await StockHistoryModel.aggregate(
      stockHistoryList({
        ipn,
        warehouseId,
        ...req.query,
      })
    );

    if (stockHistory && stockHistory.length > 0) {
      return requestSuccess(res, stockHistory);
    }

    return requestFail(
      res,
      "No stock history found for the given IPN and warehouse ID"
    );
  } catch (error) {
    return requestFail(res, "An error occurred while fetching stock history");
  }
}

async function stockAssign(req, res) {
  let StockForm = req.body;
  let warehouse = null;
  let currentStock = null;
  let StockEntry = null;

  try {
    warehouse = await WarehouseModel.findOne({ id: StockForm.warehouseId });
  } catch (error) {
    console.log(error);
  }

  if (!warehouse) {
    return requestFail(res, JSON.stringify(await WarehouseModel.find()));
  }

  try {
    StockEntry = await StockModel.findOne({
      ipn: StockForm.ipn,
      warehouseId: StockForm.warehouseId,
    });
    currentStock = parseInt(StockEntry.stock);
  } catch (err) {
    return requestFail(res, "Invalid stock for reduction.");

    currentStock = 0;
  }

  if (currentStock < StockForm.assignStock) {
    return requestFail(res, "Insufficient stock for reduction ");
  }

  let tempStock = currentStock - parseInt(StockForm.assignStock);

  if (StockEntry) {
    await StockModel.updateOne(
      { id: StockEntry.id },
      {
        $set: {
          stock: tempStock,
        },
      }
    );
  }

  // Now try to create a new stock assignment
  try {
    await new StockAssignModel({
      id: `STOA${generateId(5)}`,
      ipn: StockForm.ipn,
      warehouseId: warehouse.id,
      warehouse: warehouse.name,
      assignStock: StockForm.assignStock,
      balanceStock: tempStock,
      project: StockForm.project,
      client: StockForm.client,
      assignTo: StockForm.assignTo,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    }).save();

    await new StockHistoryModel({
      id: `STOH${generateId(5)}`,
      ipn: StockForm.ipn,
      warehouseId: warehouse.id,
      warehouse: warehouse.name,
      stock: StockForm.assignStock,
      balanceStock: tempStock,
      type: "debit",
      createdBy: req.user.id,
      updatedBy: req.user.id,
    }).save();

    return requestSuccess(res);
  } catch (error) {
    console.error(error);
    return requestFail(res, "Request failed due to internal issue.");
  }
}

async function canCreateStock(object) {
  const schema = yup.object().shape({
    ipn: yup.string().required(),
    warehouseId: yup.string().required(),
  });

  return await schema.validate(object);
}

module.exports = {
  list,
  create,
  history,
  stockAssign,
};
