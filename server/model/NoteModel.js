const db=require('../config/ConnectData')
const ApiError = require("../utils/ApiError");
class NoteModel{
    // tạo ghi chú mới (id user, data notes)
    async createNote(user_id,note, result){
         try {
        
        // tạo flashcards theo từng mảng
        if(Array.isArray(result) && result.length>0){
            const id=await db.query(
          "INSERT INTO notes (title, content,summary,file_url,public_id,user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [note.title, note.content,note.summary,note.file_url,note.public_id,user_id]
        );
        // console.log("id",id.rows[0].id);
        // console.log("result",result);
        await Promise.all(
          result.map(item => {
          return db.query(
                "INSERT INTO flashcards (note_id, question, options, answer) VALUES ($1, $2, $3, $4)",
                [id.rows[0].id, item.question, item.options, item.answer]
              );
        })
        )
        const count=await db.query("SELECT COUNT(*) as total FROM flashcards WHERE note_id = $1", [id.rows[0].id]);
        await this.savePoint(user_id,id.rows[0].id,count.rows[0].total);
        }else{
          return ApiError.BadRequest("Không tạo được flashcards or note");
        }
        
        return "success";
         } catch (error) {
          return ApiError.BadRequest("Không tạo được note");
         }
      }
      //lưu dữ liệu vào point
      async savePoint(user_id,note_id,total_question){
        return await db.query("INSERT INTO point (note_id,user_id,point,question_true,total_question,time_success) VALUES ($1,$2,$3,$4,$5,$6)",[note_id,user_id,0,0,total_question,0]);
      }
      //lấy tất cả ghi chú của user (user_id)
      async getNotes(){
        return `SELECT * FROM notes WHERE user_id = $1`;
      }
      // lấy ghi chú theo id
      async getNoteById(id){
        return await db.query("SELECT * FROM notes WHERE id = $1", [id]);
      }
      //tổng số note
      async getCountNote(){
        return `SELECT COUNT(*) as total FROM notes WHERE user_id = $1`;
      }
      // cập nhập ghi chú
      async putNote(id,note){
        return await db.query(
          "UPDATE notes SET title = $1, content = $2, summary = $3, file_url = $4 , public_id = $5 WHERE id = $6",
          [note.title, note.content,note.summary,note.file_url,note.public_id,id]
        );
      }
      // xoa ghi chú
      async deleteNote(id){
        return await db.query("DELETE FROM notes WHERE id = $1", [id]);
      }
      // lấy 5 notes gần nhất tính theo create_at
      async getRecentNotes(user_id){
        return await db.query(`SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`, [user_id]);
      }
      // lấy 1 note mới nhất theo create_at
      async getLatestNote(user_id){
        return await db.query(`SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [user_id]);
      }

}
module.exports=new NoteModel();