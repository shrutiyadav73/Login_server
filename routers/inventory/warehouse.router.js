const express = require("express");
const router = express.Router();
const WarehouseController = require("../../controllers/inventory/Warehouse.controller");

/**
 * @swagger
 * tags:
 *   name: Warehouse
 *   description: Warehouse is sub-module of inventory
 */


/**
 * @swagger
 * /api/inventory/warehouse:
 *   get:
 *     summary: Returns the list of all the warehouse
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: The list of the warehouse
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Warehouse'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", WarehouseController.index);

/**
 * @swagger
 * /api/inventory/warehouse/{id}:
 *   get:
 *     summary: Get warehouse details by Id
 *     tags: [Warehouse]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The warehouse id
 *     responses:
 *       200:
 *         description: Warehouse Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Warehouse'
 */
router.get("/:id", WarehouseController.get);

/**
 * @swagger
 * /api/inventory/warehouse:
 *   post:
 *     summary: Add a new warehouse
 *     tags: [Warehouse]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Warehouse'
 *
 *     responses:
 *       200:
 *         description: Warehouse created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", WarehouseController.create);

/**
 * @swagger
 * /api/inventory/warehouse/{id}:
 *   put:
 *     summary: Update warehouse details with warehouse id
 *     tags: [Warehouse]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The warehouse id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Warehouse'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", WarehouseController.update);

/**
 * @swagger
 * /api/inventory/warehouse/{id}:
 *   delete:
 *     summary: Delete warehouse by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the warehouse
 *     tags: [Warehouse]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Warehouse id
 */
router.delete("/:id", WarehouseController.delete);

module.exports = router;
