const {notes} = require("../utils/arrayConfig");
const {checkAtive} = require("../utils/checkUser");
const cloudinary = require("../config/ConnectCloudinary");
const {handlePdfSmart}= require("../config/Ai_handle");
class NoteServices {
    constructor(noteRepo) {
        this.noteRepo = noteRepo;
    }
    // tạo ghi chú mới
    async createNote(user_id,data,file) {
        let result=[];
        if(data.content){
            data.file_url="";
            data.public_id="";
        }else{
            data.file_url = file.cloudinaryUrl;
            data.public_id = file.publicId;
            data.content="";
           result= await handlePdfSmart(data.file_url);
        }
        // kiểm tra id user còn hoạt động và tồn tại hay chưa
            await checkAtive(user_id);
            // console.log("result",result);
            
            return await this.noteRepo.createNote(user_id,data,result);
    }
    // lấy tất cả ghi chú
    async getNotes(user_id) {
        return await this.noteRepo.getNotes(user_id);
    }
    // lấy ghi chú theo id
    async getNoteById(id) {
        return await this.noteRepo.getNoteById(id);
    }
    // cập nhật ghi chú
    async putNote(id,note, file) {
        const oleNote= await this.noteRepo.getNoteById(id);
        const olePublicID=oleNote.rows[0].public_id;
        if(file){
            await cloudinary.uploader.destroy(olePublicID);
            note.file_url = file.cloudinaryUrl;
            note.public_id = file.publicId;
            note.content="";
        }else{
            await cloudinary.uploader.destroy(olePublicID);
            note.file_url="";
            note.public_id="";
        }
        return await this.noteRepo.putNote(id,note);
    }
    // xoa ghi chú
    async deleteNote(id) {
        const oleNote= await this.noteRepo.getNoteById(id);
        const olePublicID=oleNote.rows[0].public_id;
        await cloudinary.uploader.destroy(olePublicID);
        return await this.noteRepo.deleteNote(id);
    }
}
module.exports = NoteServices;