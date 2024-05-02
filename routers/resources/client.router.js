const express = require("express");
const router = express.Router();
const ClientController = require("../../controllers/resources/Client.controller");

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: Client is sub-module of resources
 */

/**
 * @swagger
 * /api/resources/client:
 *   get:
 *     summary: Returns the list of all the clients
 *     tags: [Client]
 *     responses:
 *       200:
 *         description: The list of the clients
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Client'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", ClientController.list);

/**
 * @swagger
 * /api/resources/client/{id}:
 *   get:
 *     summary: Get client details by Id
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *     responses:
 *       200:
 *         description: Client Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the client
 */
router.get("/:id", ClientController.get);

/**
 * @swagger
 * /api/resources/client:
 *   post:
 *     summary: Add a new client
 *     tags: [Client]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *
 *     responses:
 *       200:
 *         description: Client created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", ClientController.create);

/**
 * @swagger
 * /api/resources/client/{id}:
 *   put:
 *     summary: Update client details by client id
 *     tags:
 *       - Client
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Client'
 *               - properties:
 *                   id:
 *     responses:
 *       200:
 *         description: Client Updated successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.put("/:id", ClientController.update);

/**
 * @swagger
 * /api/resources/client/{id}/update-status:
 *   put:
 *     summary: Update Status client details by client id
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Client'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/update-status", ClientController.updateStatus);

module.exports = router;
