// const { log } = require('winston');
const {user,userLogin} =require( '../utils/arrayConfig.js')
const {hashPassword,checkHashPass}  = require( '../utils/hashPassword.js');
const crypto = require('crypto');
const  sendVerificationEmail  = require('../utils/sendMail.js');
const ApiError = require("../utils/ApiError.js");
const ErrorMessageBase = require("../utils/ErrorMessageBase.js");
const {checkAtive} = require("../utils/checkUser.js");
 const tempUsers = new Map();
class  AuthService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }
 
/*************  ✨ Windsurf Command 🌟  *************/
  async registerUser(data) {
    // const userdata={};
    // user.forEach((item)=>{
    //     if (data[item]) userdata[item] = data[item];
    // })
    // CHECK mail tồn tại hay chưa
    const checkMail= await this.userRepo.checkMail(data.email);
    let errors = [];
    if (checkMail.rowCount > 0) {
        // return {error: "Email đã tồn tại"};
         errors.push({
                field: "email",
                message: ErrorMessageBase.format(ErrorMessageBase.Existed, "Email" )
            });
    }
    if(data.password.length<6 || data.password.length>20){
        errors.push({
            field: "password",
            message: ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "Password" , MinLength: 6, MaxLength: 20 })
        });
    }
     if (errors.length > 0) {
            throw ApiError.ValidationError(errors);
        }
    const hash = await hashPassword(data.password);
    data.password = hash;
    const token=crypto.randomBytes(32).toString("hex"); // tạo mã token random
    tempUsers.set( token,data);
    await sendVerificationEmail(data.email, token,"AI Note Sumalize");
    return {success: true ,message:"Vui lòng kiểm tra email để xác thực tài khoản"}
    // return await this.userRepo.createUser(userdata);
  }
/*******  3bf4eeff-0b1c-442b-9234-2a7329984509  *******/
  async loginUser(data){
    // const userdata={};
    // userLogin.forEach((item)=>{
    //     if (data[item]) userdata[item] = data[item];
    // })
     const checkMail= await this.userRepo.checkMail(data.email);
    //  console.log("check", checkMail.rows[0]);
     const errors = [];
   if (checkMail.rows.length === 0) {
        errors.push({
            field: "email",
            message: ErrorMessageBase.format(ErrorMessageBase.Incorrect, { PropertyName: "Email"} )
        });
        throw ApiError.ValidationError(errors);
    }

    const pass = await this.userRepo.getpass(data.email);
    const checkPass = await checkHashPass(String(data.password), pass.rows[0].password);

    if (!checkPass) {
        errors.push({
            field: "password",
            message: ErrorMessageBase.format(ErrorMessageBase.Incorrect, { PropertyName: "Password"} )
        });
        throw ApiError.ValidationError(errors);
    }
    const user = await this.userRepo.selectUser(data.email);
    await checkAtive(user.rows[0].id);
    return user;
  }

   async verifiMail(data){
    const token=data.token;
    const temuser=tempUsers.get(token);
    if(!temuser){
      throw ApiError.Unauthorized();
    }
    await this.userRepo.createUser(temuser);
    tempUsers.delete(token);
    return {message:"xác thực thành công"}
}
}
 
    
module.exports = AuthService;