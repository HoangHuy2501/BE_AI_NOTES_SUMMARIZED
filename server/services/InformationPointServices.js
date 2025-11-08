const InformationPointModel = require("../model/InformationPointModel");
const FlashcardModel = require("../model/FlashcardModel");
const ApiError = require("../utils/ApiError");
const ApiErrorResponse = require("../utils/ApiErrorResponse");
class InformationPointServices {
  async getInformationPoint(note_id) {
    if (!note_id) {
      throw new ApiError.BadRequest("Missing note_id");
    }
    return await InformationPointModel.getInformationPoint(note_id);
  }
  async checkAnswer(note_id, req) {
    if (!note_id) {
      throw new ApiError.BadRequest("Missing note_id");
    }
    const options = req.data;
    const countQuestion=req.question;
    const flashcard = await FlashcardModel.getFlashcardCheck(note_id);
    const CorrectAnswer = flashcard.rows;
    var countAnswer = 0;
    const results = options.map((user) => {
      const correct = CorrectAnswer.find((c) => c.id === user.id);
      const isCorrect = correct && correct.answer.trim() === user.options.trim();
      if (isCorrect) countAnswer++;
      return {
        id: user.id,
        userAnswer: user.options,
        correctAnswer: correct?.answer,
      };
    });
    const point=Number(((100/countQuestion)*countAnswer).toFixed(2));
    // lưu vào data 
    await InformationPointModel.CreatePoint(note_id,point,countAnswer);
    return {results, point};
  }
}

module.exports = new InformationPointServices();
