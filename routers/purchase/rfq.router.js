const express = require("express");
const router = express.Router();
const RFQController = require("../../controllers/purchase/RFQ.controller");

/**
 * @swagger
 * tags:
 *   name: RFQ
 *   description: RFQ is sub-module of purchase
 */

/**
 * @swagger
 * /api/purchase/rfq:
 *   get:
 *     summary: Returns the list of all the rfqs
 *     tags: [RFQ]
 *     responses:
 *       200:
 *         description: The list of the rfqs
 *       400:
 *         description: RFQ fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", RFQController.list);

/**
 * @swagger
 * /api/purchase/rfq/{id}:
 *   get:
 *     summary: Get rfq details by Id
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rfq id
 *     responses:
 *       200:
 *         description: RFQ Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/RFQ'
 */
router.get("/:id", RFQController.get);

/**
 * @swagger
 * /api/purchase/rfq:
 *   post:
 *     summary: Add a new rfq
 *     tags: [RFQ]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RFQ'
 *
 *     responses:
 *       200:
 *         description: RFQ created successfully
 *       400:
 *         description: RFQ fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", RFQController.create);

/**
 * @swagger
 * /api/purchase/rfq/{id}:
 *   put:
 *     summary: Update rfq details with rfq id
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rfq id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/RFQ'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", RFQController.update);

/**
 * @swagger
 * /api/purchase/rfq/{id}/send-mail:
 *   post:
 *     summary: send mail rfq by id
 *     description: send mail to vendor api will be send the pdf to the vendor and others
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rfq id
 */
router.post("/:id/send-mail", RFQController.sendMailToVender);

/**
 * @swagger
 * /api/purchase/rfq/{id}/action:
 *   put:
 *     summary: Action would be work as an API, such as status update and cancel
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The RFQ id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: ["send_to_vendor", "withdraw", "cancel"]
 *                 description: The action to be performed
 *               message:
 *                 type: string
 *                 description: Additional information for withdrawal or cancellation
 *             required:
 *               - action
 *             example:
 *               action: "withdraw"
 *               message: "Withdrawal reason or details"
 *     responses:
 *       '200':
 *         description: Success message
 *         content:
 *           application/json:
 *             example:
 *               result: true
 *               code: 200
 *               message: "Action performed successfully"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               result: false
 *               code: 400
 *               message: "Validation error or unexpected error"
 */

router.put("/:id/action", RFQController.action);

module.exports = router;
