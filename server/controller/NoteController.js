const {notes} = require("../utils/arrayConfig");
const NoteService = require("../services/NoteServices");
const NoteModel = require("../model/NoteModel");
const noteServices = new NoteService(NoteModel);
const ApiSuccess = require("../utils/ApiSuccess");
const ApiError = require("../utils/ApiError");
const ErrorMessageBase = require("../utils/ErrorMessageBase");
const missingField = require("../utils/missingFields");

async function CreatNote(req,res, next) {
    try {
        await missingField(notes, req.body);
        const data = req.body;
        const user_id = req.params.id;
        console.log("content", data.content, "file", req.file);
        
        // data.file_url = req.file.cloudinaryUrl;
        if(!data.content && !req.file){
            return next(ApiError.ValidationError(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "content or file_url"})));
        }
        const result = await noteServices.createNote(user_id,data, req.file);
        return res.json(ApiSuccess.created("Note", result));
    } catch (error) {
        return next(error);
    }
}
async function GetNotes(req,res, next) {
    try {
        const user_id = req.params.id;
        const result = await noteServices.getNotes(user_id);
        console.log("result", result.rows);
        
        return res.json(ApiSuccess.getSelect("Note",result.rows));
    } catch (error) {
        return next(error);
    }
}
async function GetNoteById(req,res, next) {
    try {
        const id = req.params.id; // id của note
        const result = await noteServices.getNoteById(id);
        return res.json(ApiSuccess.getSelect("Note by ID", result));
    } catch (error) {
        return next(error);
    }
}
async function PutNote(req,res, next) {
    try {
        await missingField(notes, req.body);
        const id = req.params.id; // id của note
        const data = req.body;
        // data.file_url = req.file.cloudinaryUrl;
        const result = await noteServices.putNote(id,data, req.file);
        return res.json(ApiSuccess.updated("Note", result));
    } catch (error) {
        return next(error);
    }
}
async function DeleteNote(req,res, next) {
    try {
        const id = req.params.id; // id của note
        const result = await noteServices.deleteNote(id);
        return res.json(ApiSuccess.deleted("Note", result));
    } catch (error) {
        return next(error);
    }
}
module.exports = {CreatNote,GetNotes,GetNoteById,PutNote,DeleteNote};