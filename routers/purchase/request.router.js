const express = require("express");
const router = express.Router();
const RequestController = require("../../controllers/purchase/Request.controller");

/**
 * @swagger
 * tags:
 *   name: Request
 *   description: Request is sub-module of purchase
 */

/**
 * @swagger
 * /api/purchase/request:
 *   get:
 *     summary: Returns the list of all the requests
 *     tags: [Request]
 *     responses:
 *       200:
 *         description: The list of the requests
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", RequestController.list);

/**
 * @swagger
 * /api/purchase/request/{id}:
 *   get:
 *     summary: Get request details by Id
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request id
 *     responses:
 *       200:
 *         description: Request Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Request'
 */
router.get("/:id", RequestController.get);

/**
 * @swagger
 * /api/purchase/request:
 *   post:
 *     summary: Add a new request
 *     tags: [Request]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *
 *     responses:
 *       200:
 *         description: Request created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", RequestController.create);

/**
 * @swagger
 * /api/purchase/request/{id}:
 *   put:
 *     summary: Update request details with request id
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Request'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", RequestController.update);

/**
 * @swagger
 * /api/purchase/request/{id}/correction:
 *   put:
 *     summary: Correction request details with request id
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Request'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/correction", RequestController.correction);

/**
 * @swagger
 * /api/purchase/request/{id}/approve:
 *   put:
 *     summary: Approve purchase request by approver
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Purchase Request Id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Request'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/approve", RequestController.approve);

/**
 * @swagger
 * /api/purchase/request/{id}/status:
 *   put:
 *     summary: Change Status request details with request id
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Request'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/:status", RequestController.changeStatus);

/**
 * @swagger
 * /api/purchase/request/{id}/withdraw:
 *   delete:
 *     summary: Withdraw request by id
 *     description: Withdraw api will not delete the resource from the database but is mark as Withdraw for stop the uses of the request
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request id
 */
router.delete("/:id/withdraw", RequestController.withdraw);

/**
 * @swagger
 * /api/purchase/request/{id}:
 *   delete:
 *     summary: Delete request by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the request
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The request id
 */
router.delete("/:id", RequestController.delete);

module.exports = router;
