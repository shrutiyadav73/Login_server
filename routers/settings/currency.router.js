const express = require("express");
const router = express.Router();
const CurrencyController = require("../../controllers/settings/Currency.controller");

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency is sub-module of settings
 */

/**
 * @swagger
 * /api/settings/currency:
 *   get:
 *     summary: Returns the list of all the currency
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: The list of the currency
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Currency'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", CurrencyController.list);

/**
 * @swagger
 * /api/settings/currency/{id}:
 *   get:
 *     summary: Get currency details by Id
 *     tags: [Currency]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The currency id
 *     responses:
 *       200:
 *         description: Currency Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the currency
 */
router.get("/:id", CurrencyController.get);

/**
 * @swagger
 * /api/settings/currency:
 *   post:
 *     summary: Add a new currency
 *     tags: [Currency]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *
 *     responses:
 *       200:
 *         description: Currency created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", CurrencyController.create);

/**
 * @swagger
 * /api/settings/currency/{id}:
 *   put:
 *     summary: Update client details by currency id
 *     tags: [Currency]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The currency id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Currency'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", CurrencyController.update);

/**
 * @swagger
 * /api/settings/currency/{id}:
 *   delete:
 *     summary: Delete currency by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the currency.
 *     tags: [Currency]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The currency id
 */
router.delete("/:id", CurrencyController.delete);

module.exports = router;
