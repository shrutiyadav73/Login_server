const express = require("express");
const router = express.Router();
const VendorController = require("../../controllers/purchase/Vendor.controller");

/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor is sub-module of purchase
 */

/**
 * @swagger
 * /api/purchase/vendor:
 *   get:
 *     summary: Returns the list of all the vendors
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: The list of the vendors
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Vendor'
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 *
 */

router.get("/", VendorController.list);

/**
 * @swagger
 * /api/purchase/vendor/{id}:
 *   get:
 *     summary: Get vendor details by Id
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The vendor id
 *     responses:
 *       200:
 *         description: Vendor Details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Vendor'
 */
router.get("/:id", VendorController.get);

/**
 * @swagger
 * /api/purchase/vendor:
 *   post:
 *     summary: Add a new vendor
 *     tags: [Vendor]
 *     requestBody:
 *       required: true,
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *
 *     responses:
 *       200:
 *         description: Vendor created successfully
 *       400:
 *         description: Request fail due to expire token, resource not found, more details look into message of the body
 */

router.post("/", VendorController.create);

/**
 * @swagger
 * /api/purchase/vendor/{id}:
 *   put:
 *     summary: Update vendor details with vendor id
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The vendor id
 *     requestBody:
 *       required: true,
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Vendor'
 *               - properties:
 *                   id:
 *
 */
router.put("/:id", VendorController.update);

/**
 * @swagger
 * /api/purchase/vendor/{id}:
 *   delete:
 *     summary: Delete vendor by id
 *     description: Delete api will not delete the resource from the database but is mark as delete for stop the uses of the vendor
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The vendor id
 */
router.delete("/:id", VendorController.delete);

/**
 * @swagger
 * /api/purchase/vendor/{id}/status:
 *   put:
 *     summary: Update vendor status by vendor id
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The vendor id
 *     requestBody:
 *       required: true,
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                status:
 *                  type: string
 *                  description: Status of vendor
 *                reason:
 *                  type: string
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: vendor status updated successfully
 *       400:
 *         description: Unable to update vendor status
 *
 */
router.put("/:id/status", VendorController.status);

module.exports = router;
