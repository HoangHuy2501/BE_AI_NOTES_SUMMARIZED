const flashcardServices = require("../services/FlashcardsServices");
const ApiSuccess = require("../utils/ApiSuccess");
const ApiError = require("../utils/ApiError");
const ErrorMessageBase = require("../utils/ErrorMessageBase");
const missingField = require("../utils/missingFields");
exports.GetLatestFlashcard=async(req,res, next)=> {
    try {
        const  user_id = req.params.id;
        const response = await flashcardServices.getFlashcardById(user_id);
        const data={
            flashcard:response.flashcard.rows,
            note_id:response.note_id
        };
        // console.log("flashcard", flashcard);
        return res.json(ApiSuccess.getSelect("Latest Flashcard", data));
    } catch (error) {
        return next(error);
    }
}
// lấy danh sách flashcard theo note_id
exports.GetListFlashcardByID=async(req,res, next)=> {
    try {
        const note_id=req.params.note_id;
        const flashcard = await flashcardServices.getListFlashcardByID(note_id);
        return res.json(ApiSuccess.getSelect("List Flashcard", flashcard.rows));
    } catch (error) {
        return next(error);
    }
}
