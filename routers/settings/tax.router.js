const express = require("express");
const router = express.Router();
const TaxController = require("../../controllers/settings/Tax.controller");

/**
 * @swagger
 * tags:
 *   name: Tax
 *   description: Tax is sub-module of settings
 */

/**
 * @swagger
 * /api/settings/tax:
 *   get:
 *     summary: Returns the list of all the tax
 *     tags: [Tax]
 *     responses:
 *       200:
 *         description: The list of the tax
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Tax'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */
router.get("/", TaxController.getTaxDetails);

/**
 * @swagger
 * /api/settings/tax/slab:
 *   get:
 *     summary: Returns the list of all the tax slab
 *     tags: [Tax]
 *     responses:
 *       200:
 *         description: The list of the tax slab
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Tax'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */
router.get("/slab", TaxController.list);

/**
 * @swagger
 * /api/settings/tax:
 *   put:
 *     summary: Update tax details (like GST Number)
 *     tags: [Tax]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tax id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Tax'
 *               - properties:
 *                   id:
 *
 */
router.put("/", TaxController.update);

/**
 * @swagger
 * /api/settings/tax/slab:
 *   post:
 *     summary: Add a new tax
 *     tags: [Tax]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tax'
 *
 *     responses:
 *       200:
 *         description: Tax created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */
router.post("/slab", TaxController.addTax);

/**
 * @swagger
 * /api/settings/tax/slab/{id}:
 *   put:
 *     summary: Update tax details by tax id
 *     tags: [Tax]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tax id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Tax'
 *               - properties:
 *                   id:
 *
 */
router.put("/slab/:id", TaxController.updateTax);

/**
 * @swagger
 * /api/settings/tax/slab/{id}:
 *   delete:
 *     summary: Delete tax by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the tax.
 *     tags: [Tax]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tax id
 */
router.delete("/slab/:id", TaxController.delete);

module.exports = router;
