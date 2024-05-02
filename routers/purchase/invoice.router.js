const express = require("express");
const router = express.Router();
const InvoiceController = require("../../controllers/purchase/Invoice.controller");

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: Invoice is sub-module of purchase
 */


/**
 * @swagger
 * /api/purchase/invoice:
 *   get:
 *     summary: Returns the list of all the invoices
 *     tags: [Invoice]
 *     responses:
 *       200:
 *         description: The list of the invoices
 *       400:
 *         description: Invoice fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", InvoiceController.list);

/**
 * @swagger
 * /api/purchase/invoice/{id}:
 *   get:
 *     summary: Get invoice details by Id
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     responses:
 *       200:
 *         description: Invoice Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Invoice'
 */
router.get("/:id", InvoiceController.get);

/**
 * @swagger
 * /api/purchase/invoice:
 *   post:
 *     summary: Add a new invoice
 *     tags: [Invoice]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *       400:
 *         description: Invoice fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", InvoiceController.create);

/**
 * @swagger
 * /api/purchase/invoice/{id}:
 *   put:
 *     summary: Update invoice details with invoice id
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     invoiceBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Invoice'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", InvoiceController.update);

/**
 * @swagger
 * /api/purchase/invoice/{id}/correction:
 *   put:
 *     summary: Correction invoice details with invoice id
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     invoiceBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Invoice'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/correction", InvoiceController.correction);

/**
 * @swagger
 * /api/purchase/invoice/{id}/verify:
 *   put:
 *     summary: Verify purchase invoice by verifier
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Purchase invoice Id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               poApproverId:
 *                 type: string
 *               message:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum:
 *                   - verified
 *                   - correction
 *                   - rejected
 *
 */

router.put("/:id/verify", InvoiceController.verify);


/**
 * @swagger
 * /api/purchase/invoice/{id}/approve:
 *   put:
 *     summary: Approve purchase invoice by approver
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Purchase invoice Id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Invoice'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/approve", InvoiceController.approve);


/**
 * @swagger
 * /api/purchase/invoice/{id}/changeStatus:
 *   put:
 *     summary: Change Status invoice details with invoice id
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 *     invoiceBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Invoice'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/:status", InvoiceController.changeStatus);



/**
 * @swagger
 * /api/purchase/invoice/{id}:
 *   delete:
 *     summary: Cancel invoice by id
 *     description: Cancel api will not delete the resource from the database but is mark as cancelled for stop the uses of the invoice
 *     tags: [Invoice]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice id
 */
router.delete("/:id", InvoiceController.cancel);

module.exports = router;
