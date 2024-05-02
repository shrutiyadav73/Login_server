const express = require("express");
const router = express.Router();
const ReceiveController = require("../../controllers/purchase/Receive.controller");

/**
 * @swagger
 * tags:
 *   name: Receive
 *   description: Receive is sub-module of purchase
 */

/**
 * @swagger
 * /api/purchase/receive:
 *   get:
 *     summary: Returns the list of all the receives
 *     tags: [Receive]
 *     responses:
 *       200:
 *         description: The list of the receives
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Receive'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", ReceiveController.list);

/**
 * @swagger
 * /api/purchase/receive/{id}:
 *   get:
 *     summary: Get receive details by Id
 *     tags: [Receive]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The receive id
 *     responses:
 *       200:
 *         description: Receive Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the receive
 */
router.get("/:id", ReceiveController.get);

/**
 * @swagger
 * /api/purchase/receive:
 *   post:
 *     summary: Add a new receive
 *     tags: [Receive]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Receive'
 *
 *     responses:
 *       200:
 *         description: Receive created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", ReceiveController.create);

/**
 * @swagger
 * /api/purchase/receive/{id}:
 *   put:
 *     summary: Update receive details by receive id
 *     tags: [Receive]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The receive id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Receive'
 *               - properties:
 *                   id:
 *     responses:
 *       200:
 *         description: Receive created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */
router.put("/:id", ReceiveController.update);

/**
 * @swagger
 * /api/purchase/receive/{id}/status:
 *   put:
 *     summary: Update receive status by receive id
 *     tags: [Receive]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The purchase receive id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                status:
 *                  type: string
 *                  description: Status of Purchase Receive
 *                reason:
 *                  type: string
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Purchase receive status updated successfully
 *       400:
 *         description: Unable to update purchase receive status
 *
 */
router.put("/:id/status", ReceiveController.status);

/**
 * @swagger
 * /api/purchase/receive/{id}:
 *   delete:
 *     summary: Delete receive by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the receive.
 *     tags: [Receive]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The receive id
 */
router.delete("/:id", ReceiveController.delete);

/**
 * @swagger
 * /api/purchase/receive/{id}/action:
 *   put:
 *     summary: Action would be work as an API, such as status update and cancel
 *     tags: [Receive]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Receive id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: ["send_to_igi"]
 *                 description: The action to be performed
 *               message:
 *                 type: string
 *
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

router.put("/:id/action", ReceiveController.action);

module.exports = router;
