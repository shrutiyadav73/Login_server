const express = require("express");
const router = express.Router();
const ItemController = require("../../controllers/inventory/Item.controller");

/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Item is sub-module of inventory
 */



/**
 * @swagger
 * /api/inventory/item:
 *   get:
 *     summary: Returns the list of all the items
 *     tags: [Item]
 *     responses:
 *       200:
 *         description: The list of the items
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Item'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", ItemController.list);

/**
* @swagger
 * /api/inventory/item/{id}:
 *   get:
 *     summary: Get item details by Id
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The item id
 *     responses:
 *       200:
 *         description: Item Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Item' 
 * 
 */
router.get("/:id", ItemController.get);

/**
 * @swagger
 * /api/inventory/item:
 *   post:
 *     summary: Add a new item
 *     tags: [Item]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *
 *     responses:
 *       200:
 *         description: Item created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 * 
 */

router.post("", ItemController.create);

/**
 * @swagger
 * /api/inventory/item/{id}:
 *   put:
 *     summary: Update item details with item id
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Item id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Item'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", ItemController.update);

/**
 * @swagger
 * /api/inventory/item/{id}:
 *   delete:
 *     summary: Delete item by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the item
 *     tags: [Item]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Item id
 * 
 */
router.delete("/:id", ItemController.delete);

module.exports = router;