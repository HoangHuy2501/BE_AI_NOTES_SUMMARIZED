var express = require("express");
var router = express.Router();
const uploadFile= require("../middleware/uploadFile");
const noteController = require("../controller/NoteController");
const authenticate = require("../middleware/authenticate.js");
const authorize = require("../middleware/authorize.js");
const Vilidator= require("../middleware/Vilidation.js");


router.get("/list/:id", noteController.GetNotes);
router.get("/:id", noteController.GetNoteById);
router.delete("/:id", noteController.DeleteNote);
router.post("/:id",Vilidator,uploadFile, noteController.CreatNote);
router.put("/:id",Vilidator,uploadFile, noteController.PutNote);
module.exports = router;