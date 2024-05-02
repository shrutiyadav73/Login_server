const express = require("express");
const router = express.Router();
const CategoryController = require("../../controllers/inventory/Category.controller");

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category is sub-module of inventory
 */



/**
 * @swagger
 * /api/inventory/category:
 *   get:
 *     summary: Returns the list of all the category
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: The list of the category
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Category'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", CategoryController.list);

/**
 * @swagger
 * /api/inventory/category/{id}:
 *   get:
 *     summary: Get category details by Id
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category id
 *     responses:
 *       200:
 *         description: Category Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Category'
 */
router.get("/:id", CategoryController.get);

/**
 * @swagger
 * /api/inventory/category:
 *   post:
 *     summary: Add a new category
 *     tags: [Category]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *
 *     responses:
 *       200:
 *         description: Category created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", CategoryController.create);

/**
 * @swagger
 * /api/inventory/category/{id}:
 *   put:
 *     summary: Update category details with category id
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Category'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", CategoryController.update);

/**
 * @swagger
 * /api/inventory/category/{id}:
 *   delete:
 *     summary: Delete category by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category id
 */
router.delete("/:id", CategoryController.delete);

module.exports = router;
