const express = require("express");
const router = express.Router();
const EmailController = require("../../controllers/settings/Email.controller");

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email is sub-module of settings
 */

/**
 * @swagger
 * /api/settings/email:
 *   get:
 *     summary: Returns the list of all the email
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: The list of the email
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Email'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */
router.get("/", EmailController.list);

/**
 * @swagger
 * /api/settings/email/{id}:
 *   get:
 *     summary: Get email details by Id
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The email id
 *     responses:
 *       200:
 *         description: Email Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the email
 */
router.get("/:id", EmailController.get);

/**
 * @swagger
 * /api/settings/email:
 *   post:
 *     summary: Add a new email
 *     tags: [Email]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *
 *     responses:
 *       200:
 *         description: Email created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */
router.post("", EmailController.create);

/**
 * @swagger
 * /api/settings/email/{id}:
 *   put:
 *     summary: Update email details by email id
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The email id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Email'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", EmailController.update);

/**
 * @swagger
 * /api/settings/email/{id}:
 *   delete:
 *     summary: Delete email by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the email.
 *     tags: [Email]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The email id
 */
router.delete("/:id", EmailController.delete);

module.exports = router;
