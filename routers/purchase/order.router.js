const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/purchase/Order.controller");

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order is sub-module of purchase
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier auto-generated for the order (immutable and required).
 *
 *         prId:
 *           type: string
 *
 *         vendorId:
 *           type: number
 *         poApproverId:
 *           type: number
 *         poApproverComment:
 *           type: string
 *         poApproveDate:
 *           type: string
 *         poCorrectionId:
 *           type: string
 *         correctionComment:
 *           type: string
 *         poCorrectionDate:
 *           type: string
 *         poVerifierId:
 *           type: string
 *         poVerifierComment:
 *           type: string
 *         poVerifyDate:
 *           type: string
 *
 */

/**
 * @swagger
 * /api/purchase/order:
 *   get:
 *     summary: Returns the list of all the orders
 *     tags: [Order]
 *     parameters:
 *       - in: query
 *         name: listType
 *         schema:
 *           type: string
 *         description: listType can be "correction","verification","approval"
 *     responses:
 *       200:
 *         description: The list of the orders
 *       400:
 *         description: Order fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", OrderController.list);

/**
 * @swagger
 * /api/purchase/order/{id}:
 *   get:
 *     summary: Get order details by Id
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     responses:
 *       200:
 *         description: Order Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Order'
 */
router.get("/:id", OrderController.get);

/**
 * @swagger
 * /api/purchase/order:
 *   post:
 *     summary: Add a new order
 *     tags: [Order]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Order fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", OrderController.create);


/**
 * @swagger
 * /api/purchase/order/{id}/send-mail:
 *   post:
 *     summary: send mail order by id
 *     description: send mail to vendor api will be send the pdf to the vendor and others
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 */
router.post("/:id/send-mail", OrderController.sendMailToVender);


/**
 * @swagger
 * /api/purchase/order/{id}:
 *   put:
 *     summary: Update order details with order id
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Order'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", OrderController.update);

/**
 * @swagger
 * /api/purchase/order/{id}/correction:
 *   put:
 *     summary: Correction order details with order id
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Order'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/correction", OrderController.correction);

/**
 * @swagger
 * /api/purchase/order/{id}/verify:
 *   put:
 *     summary: Verify purchase order by verifier
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Purchase Order Id
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
 *                 type: sting
 *                 enum:
 *                   - verified
 *                   - correction
 *                   - rejected
 *
 */

router.put("/:id/verify", OrderController.verify);

/**
 * @swagger
 * /api/purchase/order/{id}/approve:
 *   put:
 *     summary: Approve purchase order by approver
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Purchase Order Id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Order'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/approve", OrderController.approve);

/**
 * @swagger
 * /api/purchase/order/{id}/changeStatus:
 *   put:
 *     summary: Change Status order details with order id
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     orderBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Order'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/:status", OrderController.changeStatus);

/**
 * @swagger
 * /api/purchase/order/{id}:
 *   delete:
 *     summary: Cancel order by id
 *     description: cancel api will not delete the resource from the database but is mark as cancelled for stop the uses of the order
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 */
router.delete("/:id", OrderController.cancel);

module.exports = router;
