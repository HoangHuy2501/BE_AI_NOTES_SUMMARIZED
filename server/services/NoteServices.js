const { notes } = require("../utils/arrayConfig");
const { checkAtive } = require("../utils/checkUser");
const cloudinary = require("../config/ConnectCloudinary");
const { handlePdfSmart } = require("../config/Ai_handle");
// const { handlePdfSmart } = require("../config/AI_gemini");
const { getPanigation } = require("./PanigationServices");
const NoteModel = require("../model/NoteModel");
const FlashcardModel = require("../model/FlashcardModel");
const ApiError = require("../utils/ApiError");
class NoteServices {
  // tạo ghi chú mới
  async createNote(user_id, data, file) {
    let result = [];
    if (!data.numberQuestion) {
      data.numberQuestion = 15;
    } else {
      // kiểm tra có phải là số hợp lệ không
      const num = Number(data.numberQuestion);
      if (isNaN(num)) {
        throw new ApiError.ValidationError("numberQuestion must be a valid number");
      }
      data.numberQuestion = num; // ép kiểu về số
    }
    if (data.content) {
      data.file_url = "";
      data.public_id = "";
    } else {
      data.file_url = file.cloudinaryUrl;
      data.public_id = file.publicId;
      data.content = "";
      result = await handlePdfSmart(data.file_url, data.numberQuestion);
    }
    // kiểm tra id user còn hoạt động và tồn tại hay chưa
    await checkAtive(user_id);
    // console.log("result",result);

    return await NoteModel.createNote(user_id, data, result);
  }
  // lấy tất cả ghi chú
  async getNotes(user_id, queryParams) {
    const dbmodel = await NoteModel.getNotes();
    const count = await NoteModel.getCountNote();
    return getPanigation(queryParams, dbmodel, user_id, count);
  }
  // lấy ghi chú theo id
  async getNoteById(id) {
    return await NoteModel.getNoteById(id);
  }
  // lấy 5 notes gần nhất
  async getRecentNotes(user_id) {
    await checkAtive(user_id);
    return await NoteModel.getRecentNotes(user_id);
  }
  // cập nhật ghi chú (chưa hoàn thiện)
  async putNote(id, note, file) {
    const oleNote = await NoteModel.getNoteById(id);
    const olePublicID = oleNote.rows[0].public_id;
    if (file) { 
      await cloudinary.uploader.destroy(olePublicID);
      note.file_url = file.cloudinaryUrl;
      note.public_id = file.publicId;
      note.content = "";
      result = await handlePdfSmart(data.file_url, data.numberQuestion);
    } else {
      await cloudinary.uploader.destroy(olePublicID);
      note.file_url = "";
      note.public_id = "";
    }
    return await NoteModel.putNote(id, note);
  }
  // xoa ghi chú
  async deleteNote(id) {
    const oleNote = await NoteModel.getNoteById(id);
    const olePublicID = oleNote.rows[0].public_id;
    await cloudinary.uploader.destroy(olePublicID);
    await FlashcardModel.deleteFlashcard(id);
    await NoteModel.deleteNote(id);
    return "success";
  }
}
module.exports = new NoteServices();
