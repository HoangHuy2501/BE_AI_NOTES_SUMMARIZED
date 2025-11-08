const FlashcardModel=require("../model/FlashcardModel");
const NoteModel = require("../model/NoteModel");
class FlashcardServices{
    // lấy flashcard theo note_id gần nhất limit 1
    async getFlashcardById(user_id) {
        const latestNote = await NoteModel.getLatestNote(user_id);
        if(!latestNote || latestNote.rows.length === 0) {
            return 'Not have note';
        }
        const note_id=latestNote.rows[0].id;
        const flashcard = await FlashcardModel.getFlashcardById(latestNote.rows[0].id);
        return {flashcard,note_id};
    }
    async getListFlashcardByID(note_id) {
        const flashcard = await FlashcardModel.getFlashcardById(note_id);
        return flashcard;
    }
}
module.exports =new FlashcardServices();