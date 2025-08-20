const { body, validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");
const ErrorMessageBase = require("../utils/ErrorMessageBase");
const validateUser = [
  body("email").optional().notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "email"})).isEmail().withMessage(ErrorMessageBase.InvalidEmail),
  body("password").optional().notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "password"})).isLength({ min: 4, max: 30 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "password", MinLength: 4, MaxLength: 30})),
  body("name").optional().notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "name"})),
  body("title").optional().notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "title"})).isLength({ min: 2, max: 200 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "title", MinLength: 2, MaxLength: 200})),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
      throw ApiError.ValidationError(formattedErrors);
    }
    next();
  }
];

module.exports =  validateUser ;