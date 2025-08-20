const { user, userLogin } = require("../utils/arrayConfig");
const logger = require("../utils/log");
const jwt = require("jsonwebtoken");
const authService= require("../services/AuthServices");
const UserModel = require("../model/UserModel");
const missingField= require("../utils/missingFields");
const authServices = new authService(UserModel);
const ApiSuccess= require("../utils/ApiSuccess");

async function register(req, res, next) {
  try {
    // const missingFields = user.filter((field) => !req.body[field]);
    // const errors = [];
    // if (missingFields.length > 0) {
    //   // return res.status(400).json({
    //   //   message: "Thiếu thông tin",
    //   //   missing: missingFields,
    //   // });
    //   errors.push({
    //     field: missingFields.join(", "),
    //     message: ErrorMessageBase.format(ErrorMessageBase.missingFields,""),
    //   });
    // }
    // if (errors.length > 0) {
    //   return next(ApiError.ValidationError(errors));
    // }
    await missingField(user, req.body);
    const data = req.body;
    data.image = req.file ? req.file.filename : null;
    const result = await authServices.registerUser(data);
    return res.json(ApiSuccess.getSelect("User", result));
    
  } catch (error) {
    logger.error(`Lỗi khi đăng ký người dùng: ${error.message}`);
    return next(error);
  }
}
//xác thực
async function verify(req, res, next) {
  try {
    const data= req.query;
    const result = await authServices.verifiMail(data);
    return res.json(ApiSuccess.created("User", result));

  } catch (error) {
    logger.error(`Lỗi khi xác thức người dùng: ${error.message}`);
    return next(error);
  }
}
//login
async function login(req, res, next) {
  try {
    // const missingFields = userLogin.filter((field) => !req.body[field]);
    // const errors = [];
    // if (missingFields.length > 0) {
    //   // return res.status(400).json({
    //   //   message: "Thiếu thông tin",
    //   //   missing: missingFields,
    //   // });
    //   errors.push({
    //     field: missingFields.join(", "),
    //     message: ErrorMessageBase.format(ErrorMessageBase.missingFields,""),
    //   });
    // }
    // if (errors.length > 0) {
    //   return next(ApiError.ValidationError(errors));
    // }
    await missingField(userLogin, req.body);
          const result = await authServices.loginUser(req.body);
          const userData = result.rows[0];
    const token = jwt.sign(
      { userId: userData.id, role: userData.role, name: userData.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Đăng nhập tháng cong",
        token,
        user: {
          name: userData.name,
          role: userData.role,
          id: userData.id,
          email: userData.email,
        },
      });

    
  } catch (error) {
    logger.error(`Lỗi khi đăng nhập người dùng: ${error.message}`);
    return next(error);
  }
}
module.exports = { register, login, verify };
