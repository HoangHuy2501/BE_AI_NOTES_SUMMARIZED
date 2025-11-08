const express=require("express");
const router=express.Router();
const InformationPointController=require("../controller/PointController");
router.get("/list/:note_id",InformationPointController.InformationPoint);
router.put("/check-aswers/:note_id", InformationPointController.CheckAnswer);
module.exports=router;