const express = require("express");
const router = express.Router();
const StockController = require("../../controllers/inventory/Stock.controller");

/**
 * @swagger
 * tags:
 *   name: Stock 
 *   description: Stock is sub-module of inventory
 */



/**
 * @swagger
 * /api/inventory/stock:
 *   get:
 *     summary: Returns the list of all the stock
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: The list of the stock
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", StockController.list);

/**
 * @swagger
 * /api/inventory/stock/{ipn}/{warehouseId}:
 *   get:
 *     summary: Returns the list of all the stock history
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: The list of the stock history
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/StockHistory'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/:ipn/:warehouseId", StockController.history);




/**
 * @swagger
 * /api/inventory/stock:
 *   post:
 *     summary: Add a new stock
 *     tags: [Stock]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stock'
 *
 *     responses:
 *       200:
 *         description: Stock created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", StockController.create);


/**
 * @swagger
 * /api/inventory/stock/assign:
 *   post:
 *     summary: Assign a  stock (remove)
 *     tags: [Stock]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAssign'
 *
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("/assign", StockController.stockAssign);



module.exports = router;
