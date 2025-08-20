const { checkActive } = require('../model/UserModel');
const ApiError = require("../utils/ApiError");
const ErrorMessageBase = require("../utils/ErrorMessageBase");

// Kiểm tra tài khoản còn hoạt động hoặc tồn tại không
async function checkAtive(id) {
  const checkUser = await checkActive(id);


  if (checkUser.rows[0].active === false) {
    throw ApiError.NotFound(ErrorMessageBase.format(ErrorMessageBase.ActiveFalse, { PropertyName: `user_${id}` }));
  }

  return true;
}

module.exports = {checkAtive};

