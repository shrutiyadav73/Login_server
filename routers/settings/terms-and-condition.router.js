const express = require("express");
const router = express.Router();
const TermsAndConditionController = require("../../controllers/settings/TermsAndCondition.controller");

/**
 * @swagger
 * tags:
 *   name: TermsAndCondition
 *   description: Terms And Condition is sub-module of settings
 */

/**
 * @swagger
 * /api/settings/terms-and-condition:
 *   get:
 *     summary: Returns the list of all the terms and condition
 *     tags: [TermsAndCondition]
 *     responses:
 *       200:
 *         description: The list of the terms and condition
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/TermsAndCondition'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */
router.get("/", TermsAndConditionController.list);

/**
 * @swagger
 * /api/settings/terms-and-condition/{id}:
 *   get:
 *     summary: Get terms and condition details by Id
 *     tags: [TermsAndCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TermsAndCondition id
 *     responses:
 *       200:
 *         description: Terms And Condition Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the termsandcondition
 */
router.get("/:id", TermsAndConditionController.get);

/**
 * @swagger
 * /api/settings/terms-and-condition:
 *   post:
 *     summary: Add a new terms and condition
 *     tags: [TermsAndCondition]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermsAndCondition'
 *
 *     responses:
 *       200:
 *         description: TermsAndCondition created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */
router.post("", TermsAndConditionController.create);

/**
 * @swagger
 * /api/settings/terms-and-condition/{id}:
 *   put:
 *     summary: Update terms and condition details by terms and condition id
 *     tags: [TermsAndCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The termsandcondition id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/TermsAndCondition'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", TermsAndConditionController.update);

/**
 * @swagger
 * /api/settings/terms-and-condition/{id}/update-status:
 *   put:
 *     summary: Update terms and condition details by terms and condition id
 *     tags: [TermsAndCondition]
 *     parameters:
 *       - in: path|| !req.params.status
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The terms and condition id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/TermsAndCondition'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id/update-status", TermsAndConditionController.updateStatus);

/**
 * @swagger
 * /api/settings/terms-and-condition/{id}:
 *   delete:
 *     summary: Delete terms and condition by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the terms and condition.
 *     tags: [TermsAndCondition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The TermsAndCondition id
 */
router.delete("/:id", TermsAndConditionController.delete);

module.exports = router;
