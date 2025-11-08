const { user, userLogin } = require("../utils/arrayConfig");
const logger = require("../utils/log");
const jwt = require("jsonwebtoken");
const ENV = require('../config/env.js');
const missingField = require("../utils/missingFields");
const authServices = require("../services/AuthServices");
const ApiSuccess = require("../utils/ApiSuccess");
const ApiErrors=require("../utils/ApiError");
const { log } = require("winston");

async function register(req, res, next) {
  try { 
    await missingField(user, req.body);
    const data = req.body;
    // Chỉ gán nếu có file upload
    if (req.file) {
      data.image = req.file.cloudinaryUrl;
      data.publicImage = req.file.publicId;
    } else {
      data.image = null;
      data.publicImage = null;
    }
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
    const data = req.query;
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
    await missingField(userLogin, req.body);
    const result = await authServices.loginUser(req.body);
    const userData = result.rows[0];
    await authServices.deleteRefreshToken(userData.id);
    // access token (sống ngắn, ví dụ 1 giờ)
    const token = jwt.sign(
      { userId: userData.id, role: userData.role, name: userData.name },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // refresh token (sống lâu hơn, ví dụ 7 ngày)
    const refreshToken = jwt.sign(
      { userId: userData.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "20d" }
    );

    await authServices.saveRefreshToken(refreshToken, userData.id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        name: userData.name,
        role: userData.role,
        id: userData.id,
        email: userData.email,
        image: userData.image,
      },
    });
  } catch (error) {
    logger.error(`Lỗi khi đăng nhập người dùng: ${error.message}`);
    return next(error);
  }
}
async function refreshToken(req, res, next) {
  try {
    const { token, id } = req.body;
    if (!token) {
      return ApiErrors.Unauthorized("Missing refresh token");
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            logger.warn(`⚠️ Token hợp lệ nhưng thiếu userId | Token: ${token.slice(0, 10)}...`);
            return next(ApiError.Unauthorized("Thông tin người dùng không hợp lệ."));
        }
    // Kiểm tra refresh token có trong DB không
    const isValid = await authServices.checkRefreshToken(id);
    // console.log("isValid: ", isValid.rows[0].token);
    
    if (!isValid) {
      return ApiErrors.Forbidden("Refresh token không hợp lệ");
    }
    
    // Verify refresh token
    jwt.verify(isValid.rows[0].token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return ApiErrors.Forbidden("Refresh token hết hạn");
      }
      
      // Tạo access token mới
      const newAccessToken = jwt.sign(
        { userId: user.userId, role: decoded.role, name: decoded.name },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      return res.json({
        success: true,
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    logger.error(`Lỗi khi refresh token: ${error.message}`);
    return next(error);
  }
}

  async function logout(req, res, next) {
    try {
      const { id } = req.params;
      await authServices.deleteRefreshToken(id);
      return res.json(ApiSuccess.deleted("Refresh token", id));
    } catch (error) {
      logger.error(`Lỗi khi xóa refresh token: ${error.message}`);
      return next(error);
    }
  }
module.exports = { register, login, verify, refreshToken, logout };
