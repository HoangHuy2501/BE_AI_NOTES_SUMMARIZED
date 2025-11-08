var express = require("express");
var router = express.Router();
const uploadImageCloudinary = require("../middleware/uploadImage.js");
const authController = require("../controller/AuthController.js");
const authenticate = require("../middleware/authenticate.js");
const authorize = require("../middleware/authorize.js");
const Vilidator= require("../middleware/Vilidation.js");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", uploadImageCloudinary, authController.register);
router.get("/verify", authController.verify);
router.post("/login",Vilidator, authController.login);
router.post("/check/refresh-token", authController.refreshToken);
router.post("/logout/:id",authenticate, authController.logout);

module.exports = router;
