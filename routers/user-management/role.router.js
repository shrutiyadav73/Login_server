const express = require("express");
const router = express.Router();
const RoleController = require("../../controllers/userManagement/Role.controller");

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role is sub-module of roleManagement
 */

/**
 * @swagger
 * /api/user-management/role:
 *   get:
 *     summary: Returns the list of all the Roles
 *     tags: [Role]
 *     responses:
 *       200:
 *         description: The list of the Role
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Role'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */
router.get("/", RoleController.list);

/**
 * @swagger
 * /api/user-management/role/{id}:
 *   get:
 *     summary: Get role details by Id
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role id
 *     responses:
 *       200:
 *         description: Role Details
 *       400:
 *         description: Bad Request, Something went wrong can't find the client
 */
router.get("/:id", RoleController.get);

/**
 * @swagger
 * /api/user-management/role:
 *   post:
 *     summary: Add a new role
 *     tags: [Role]
 *     requestBody:
 *       required: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *
 *     responses:
 *       200:
 *         description: Role created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("/", RoleController.create);

/**
 * @swagger
 * /api/user-management/role/{id}:
 *   put:
 *     summary: Update role details by role id
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role id
 *     requestBody:
 *       require: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Role'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", RoleController.update);

/**
 * @swagger
 * /api/user-management/role/{id}:
 *   delete:
 *     summary: Delete role by id
 *     description: Delete api will not delete the resource from the database but it will mark as delete for stop the uses of the client.
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role id
 */
router.delete("/:id", RoleController.delete);

module.exports = router;