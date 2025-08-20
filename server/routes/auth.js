var express = require("express");
var router = express.Router();
const upload = require("../middleware/uploadImage.js");
const authController = require("../controller/AuthController.js");
const authenticate = require("../middleware/authenticate.js");
const authorize = require("../middleware/authorize.js");
const Vilidator= require("../middleware/Vilidation.js");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", upload.single("image"), authController.register);
router.get("/verify", authController.verify);
router.post("/login",Vilidator, authController.login);

module.exports = router;
