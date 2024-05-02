const express = require("express");
const router = express.Router();
const SubCategoryController = require("../../controllers/inventory/SubCategory.controller");

/**
 * @swagger
 * tags:
 *   name: SubCategory
 *   description: SubCategory is sub-module of inventory
 */



/**
 * @swagger
 * /api/inventory/subcategory:
 *   get:
 *     summary: Returns the list of all the subcategory
 *     tags: [SubCategory]
 *     responses:
 *       200:
 *         description: The list of the subcategory
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/SubCategory'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", SubCategoryController.list);

/**
 * @swagger
 * /api/inventory/subcategory/{id}:
 *   get:
 *     summary: Get subcategory details by Id
 *     tags: [SubCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The subcategory id
 *     responses:
 *       200:
 *         description: subcategory Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/SubCategory'
 */
router.get("/:id", SubCategoryController.get);

/**
 * @swagger
 * /api/inventory/subcategory:
 *   post:
 *     summary: Add a new subcategory
 *     tags: [SubCategory]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubCategory'
 *
 *     responses:
 *       200:
 *         description: SubCategory created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", SubCategoryController.create);

/**
 * @swagger
 * /api/inventory/subcategory/{id}:
 *   put:
 *     summary: Update subcategory details with subcategory id
 *     tags: [SubCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The subcategory id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/SubCategory'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", SubCategoryController.update);

/**
 * @swagger
 * /api/inventory/subcategory/{id}:
 *   delete:
 *     summary: Delete subcategory by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the subcategory
 *     tags: [SubCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The subcategory id
 */
router.delete("/:id", SubCategoryController.delete);

module.exports = router;
