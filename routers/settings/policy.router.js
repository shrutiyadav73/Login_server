const express = require("express");
const router = express.Router();
const PolicyController = require("../../controllers/settings/Policy.controller");

/**
 * @swagger
 * tags:
 *   name: Policy
 *   description: Policy is sub-module of settings
 */

/**
 * @swagger
 * /api/settings/policy:
 *   get:
 *     summary: Returns the list of all the policy
 *     tags: [Policy]
 *     responses:
 *       200:
 *         description: The list of the policy
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Policy'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", PolicyController.list);

/**
 * @swagger
 * /api/settings/policy/{id}:
 *   get:
 *     summary: Get policy details by Id
 *     tags: [Policy]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The policy id
 *     responses:
 *       200:
 *         description: policy Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the policy
 */
router.get("/:id", PolicyController.get);

/**
 * @swagger
 * /api/settings/policy:
 *   post:
 *     summary: Add a new policy
 *     tags: [Policy]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Policy'
 *
 *     responses:
 *       200:
 *         description: Policy created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", PolicyController.create);

/**
 * @swagger
 * /api/settings/policy/{id}:
 *   put:
 *     summary: Update policy details by policy id
 *     tags: [Policy]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The policy id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Policy'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", PolicyController.update);

/**
 * @swagger
 * /api/settings/policy/{id}:
 *   delete:
 *     summary: Delete policy by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the policy.
 *     tags: [Policy]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The policy id
 */
router.delete("/:id", PolicyController.delete);

module.exports = router;
