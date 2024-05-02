const express = require("express");
const router = express.Router();
const ManufactureController = require("../../controllers/inventory/Manufacture.controller");

/**
 * @swagger
 * tags:
 *   name: Manufacture
 *   description: Manufacture is sub-module of inventory
 */



/**
 * @swagger
 * /api/inventory/manufacture:
 *   get:
 *     summary: Returns the list of all the manufacture
 *     tags: [Manufacture]
 *     responses:
 *       200:
 *         description: The list of the manufacture
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Manufacture'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", ManufactureController.list);

/**
 * @swagger
 * /api/inventory/manufacture/{id}:
 *   get:
 *     summary: Get manufacture details by Id
 *     tags: [Manufacture]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The manufacture id
 *     responses:
 *       200:
 *         description: Manufacture Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Manufacture'
 */
router.get("/:id", ManufactureController.get);

/**
 * @swagger
 * /api/inventory/manufacture:
 *   post:
 *     summary: Add a new manufacture
 *     tags: [Manufacture]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Manufacture'
 *
 *     responses:
 *       200:
 *         description: Manufacture created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", ManufactureController.create);

/**
 * @swagger
 * /api/inventory/manufacture/{id}:
 *   put:
 *     summary: Update manufacture details with manufacture id
 *     tags: [Manufacture]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The manufacture id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Manufacture'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", ManufactureController.update);

/**
 * @swagger
 * /api/inventory/manufacture/{id}:
 *   delete:
 *     summary: Delete manufacture by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the manufacture
 *     tags: [Manufacture]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The manufacture id
 */
router.delete("/:id", ManufactureController.delete);

module.exports = router;
