const express = require("express");
const router = express.Router();
const IndentorController = require("../../controllers/resources/Indentor.controller");

/**
 * @swagger
 * tags:
 *   name: Indentor
 *   description: Indentor is sub-module of resources
 */

/**
 * @swagger
 * /api/resources/indentor:
 *   get:
 *     summary: Returns the list of all the indentor
 *     tags: [Indentor]
 *     responses:
 *       200:
 *         description: The list of the indentor
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Indentor'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", IndentorController.list);

/**
 * @swagger
 * /api/resources/indentor/{id}:
 *   get:
 *     summary: Get indentor details by Id
 *     tags: [Indentor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The indentor id
 *     responses:
 *       200:
 *         description: Indentor Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the indentor
 */
router.get("/:id", IndentorController.get);

/**
 * @swagger
 * /api/resources/indentor:
 *   post:
 *     summary: Add a new indentor
 *     tags: [Indentor]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Indentor'
 *
 *     responses:
 *       200:
 *         description: Indentor created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", IndentorController.create);

/**
 * @swagger
 * /api/resources/indentor/{id}:
 *   put:
 *     summary: Update Indentor details by indentor id
 *     tags: [Indentor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The indentor id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Indentor'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", IndentorController.update);

/**
 * @swagger
 * /api/resources/indentor/{id}:
 *   delete:
 *     summary: Delete indentor by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the indentor.
 *     tags: [Indentor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The indentor id
 */
router.delete("/:id", IndentorController.delete);

module.exports = router;
