const db=require('../config/ConnectData')
class InformationPointModel{
    // lấy dữ liệu tên note, bảng điểm
    async getInformationPoint(note_id){
        return db.query(`Select n.title, p.point, p.question_true, p.total_question, p.time_success from point p, notes n where p.note_id = n.id and p.note_id=$1`,[note_id] );
    }
    // lưu điểm và lưu số câu hỏi đúng
    async CreatePoint(note_id,point,countAnswer){
        return db.query(`update point set point=$1, question_true=$2 where note_id=$3`,[point,countAnswer,note_id]);
    }
}
module.exports = new InformationPointModel();