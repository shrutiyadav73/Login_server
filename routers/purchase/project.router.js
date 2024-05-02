const express = require("express");
const router = express.Router();
const ProjectController = require("../../controllers/purchase/Project.controller");

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Project is sub-module of purchase
 */

/**
 * @swagger
 * /api/purchase/project:
 *   get:
 *     summary: Returns the list of all the projects
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: The list of the projects
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Project'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", ProjectController.list);

/**
 * @swagger
 * /api/purchase/project/{id}:
 *   get:
 *     summary: Get project details by Id
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project id
 *     responses:
 *       200:
 *         description: Project Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the project
 */
router.get("/:id", ProjectController.get);

/**
 * @swagger
 * /api/purchase/project:
 *   post:
 *     summary: Add a new project
 *     tags: [Project]
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *
 *     responses:
 *       200:
 *         description: Project created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("", ProjectController.create);

/**
 * @swagger
 * /api/purchase/project/{id}:
 *   put:
 *     summary: Update project details by project id
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Project'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", ProjectController.update);

/**
 * @swagger
 * /api/purchase/project/{id}:
 *   delete:
 *     summary: Delete project by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the project.
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The project id
 */
router.delete("/:id", ProjectController.delete);

module.exports = router;
