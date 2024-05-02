const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/website/Contact.controller");
const WebProductHandler = require("../controllers/website/handlers/Product.handler");
const WebCategoryHandler = require("../controllers/website/handlers/Category.handler");
const AuthController = require("../controllers/website/Auth.controller");

// POST METHOD
router.post("/contact", ContactController.create);


router.get("/category", WebCategoryHandler);
router.get("/product", WebProductHandler);

// router.post("/auth", CustomerController.create);
// router.post("/auth/login", CustomerController.create);

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

router.post("/auth/verify", AuthController.verify);
router.post("/auth/resend-otp", AuthController.reSendOTP);
router.post("/auth/forget-password", AuthController.forget);
router.post("/auth/change-password", AuthController.changePassword);

module.exports = router;
    