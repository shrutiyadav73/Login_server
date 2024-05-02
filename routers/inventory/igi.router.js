const express = require("express");
const router = express.Router();
const IGIController = require("../../controllers/inventory/IGI.controller");

/**
 * @swagger
 * tags:
 *   name: IGI
 *   description: IGI is sub-module of inventory
 */

/**
 * @swagger
 * /api/inventory/igi:
 *   get:
 *     summary: Returns the list of all the igi
 *     tags: [IGI]
 *     responses:
 *       200:
 *         description: The list of the igi
 *       400:
 *         description: IGI fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", IGIController.list);

/**
 * @swagger
 * /api/inventory/igi/{id}:
 *   get:
 *     summary: Get igi details by Id
 *     tags: [IGI]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The igi id
 *     responses:
 *       200:
 *         description: IGI Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/IGI'
 */
router.get("/:id", IGIController.get);

/**
 * @swagger
 * /api/inventory/igi/{id}:
 *   put:
 *     summary: Update igi details with igi id
 *     tags: [IGI]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The igi id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/IGI'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", IGIController.save);

/**
 * @swagger
 * /api/inventory/igi/{id}/action:
 *   put:
 *     summary: Perform the action based on IGI
 *     tags: [IGI]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The igi id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/IGI'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/action", IGIController.action);

module.exports = router;
