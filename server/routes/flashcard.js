var express = require("express");
var router = express.Router();
const flashcardController = require("../controller/FlashcardController");
router.get("/latest/:id", flashcardController.GetLatestFlashcard); // id user
router.get("/list/:note_id", flashcardController.GetListFlashcardByID); // id user
module.exports = router;