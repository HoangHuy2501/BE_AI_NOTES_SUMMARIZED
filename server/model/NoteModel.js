const db=require('../config/ConnectData')
const ApiError = require("../utils/ApiError");
module.exports={
    // tạo ghi chú mới (id user, data notes)
    createNote: async (user_id,note, result) => {
         try {
        
        // tạo flashcards theo từng mảng
        if(Array.isArray(result) && result.length>0){
            const id=await db.query(
          "INSERT INTO notes (title, content,summary,file_url,public_id,user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [note.title, note.content,note.summary,note.file_url,note.public_id,user_id]
        );
        console.log("id",id.rows[0].id);
        console.log("result",result);
         result.forEach(item => {
            db.query(
                "INSERT INTO flashcards (note_id, question, options, answer) VALUES ($1, $2, $3, $4)",
                [id.rows[0].id, item.question, item.options, item.answer]
              );
        });
        }else{
          return ApiError.BadRequest("Không tạo được flashcards or note");
        }
        
        return "success";
         } catch (error) {
          return ApiError.BadRequest("Không tạo được note");
         }
      },
      //lấy tất cả ghi chú của user (user_id)
      getNotes: async (user_id) => {
        return await db.query("SELECT * FROM notes WHERE user_id = $1", [user_id]);
      },
      // lấy ghi chú theo id
      getNoteById: async (id) => {
        return await db.query("SELECT * FROM notes WHERE id = $1", [id]);
      },
      // cập nhập ghi chú
      putNote: async (id,note) => {
        return await db.query(
          "UPDATE notes SET title = $1, content = $2, summary = $3, file_url = $4 , public_id = $5 WHERE id = $6",
          [note.title, note.content,note.summary,note.file_url,note.public_id,id]
        );
      },
      // xoa ghi chú
      deleteNote: async (id) => {
        return await db.query("DELETE FROM notes WHERE id = $1 and user_id = $2", [id]);
      },

}