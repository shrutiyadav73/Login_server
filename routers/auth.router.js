const router = require("express").Router();
const controller = require("../controllers/Auth.controller");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/forget-password", controller.forgetPassword);
router.post("/change-password", controller.changePassword);

module.exports = router;
