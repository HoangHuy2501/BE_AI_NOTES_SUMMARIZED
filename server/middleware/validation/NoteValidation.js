const { body, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiError");
const ErrorMessageBase = require("../../utils/ErrorMessageBase");
const validateUser = [
  body("title").optional().notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "title"})),
  body("questionNumber").optional().notEmpty().withMessage(ErrorMessageBase.format(ErrorMessageBase.NotEmpity, { PropertyName: "questionNumber"})).isInt({ min: 10, max: 40 }).withMessage(ErrorMessageBase.format(ErrorMessageBase.Range, { PropertyName: "questionNumber", MinLength: 10, MaxLength: 40})),
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