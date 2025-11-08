const InformationPointServices=require("../services/InformationPointServices");
const ApiSuccess = require("../utils/ApiSuccess");
// lấy thông tin của point
exports.InformationPoint=async(req,res, next)=> {
    try {
        const note_id=req.params.note_id;
        const informationPoint = await InformationPointServices.getInformationPoint(note_id);
        return res.json(ApiSuccess.getSelect("Information Point", informationPoint.rows[0]));
    } catch (error) {
        return next(error);
    }
}
// nhận các đáp án, và kiểm tra đáp án chấm điểm
exports.CheckAnswer=async(req,res, next)=> {
    try {
        const note_id=req.params.note_id;
        const results=await InformationPointServices.checkAnswer(note_id,req.body);
        const data={
            result:results.results,
            point:results.point
        }
        return res.json(ApiSuccess.updated("check answer",data));
    } catch (error) {
        return next(error);
    }
}