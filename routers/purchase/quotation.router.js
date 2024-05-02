const express = require("express");
const router = express.Router();
const QuotationController = require("../../controllers/purchase/Quotation.controller");

/**
 * @swagger
 * tags:
 *   name: Quotation
 *   description: Quotation is sub-module of purchase
 */

/**
 * @swagger
 * /api/purchase/quotation:
 *   get:
 *     summary: Returns the list of all the quotations
 *     tags: [Quotation]
 *     responses:
 *       200:
 *         description: The list of the quotations
 *       400:
 *         description: Quotation fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", QuotationController.list);

/**
 * @swagger
 * /api/purchase/quotation/{id}:
 *   get:
 *     summary: Get quotation details by Id
 *     tags: [Quotation]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The quotation id
 *     responses:
 *       200:
 *         description: Quotation Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Quotation'
 */
router.get("/:id", QuotationController.get);

/**
 * @swagger
 * /api/purchase/quotation:
 *   post:
 *     summary: Add a new quotation
 *     tags: [Quotation]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quotation'
 *
 *     responses:
 *       200:
 *         description: Quotation created successfully
 *       400:
 *         description: Quotation fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", QuotationController.create);

/**
 * @swagger
 * /api/purchase/quotation/{id}:
 *   put:
 *     summary: Update quotation details with quotation id
 *     tags: [Quotation]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The quotation id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Quotation'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", QuotationController.update);

/**
 * @swagger
 * /api/purchase/quotation/{id}:
 *   delete:
 *     summary: Cancel quotation by id
 *     description: Cancel api will not delete the resource from the database but it will mark as cancel for stop the uses of the quotation.
 *     tags: [Quotation]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The quotation id
 */
router.delete("/:id", QuotationController.cancel);

module.exports = router;
