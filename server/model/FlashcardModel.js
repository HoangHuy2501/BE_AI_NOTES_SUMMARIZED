const db=require('../config/ConnectData')
class FlashcardModel{
    //xóa flashcard
    async deleteFlashcard(id){
        return await db.query("DELETE FROM flashcards WHERE note_id = $1", [id]);
    }
    // lấy flashcard để gửi các câu hỏi theo id
    async getFlashcardById(id){
        const data=await db.query("SELECT id, question, options FROM flashcards WHERE note_id = $1", [id]);
        return data;
    }
    // lấy flashcard để kiểm tra kết quả
    async getFlashcardCheck(note_id){
        const data=await db.query("SELECT id, answer FROM flashcards WHERE note_id = $1", [note_id]);
        return data;
    }
}
module.exports=new FlashcardModel();