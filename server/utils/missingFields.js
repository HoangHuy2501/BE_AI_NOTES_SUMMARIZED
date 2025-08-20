const ApiError = require("../utils/ApiError");
const ErrorMessageBase = require("../utils/ErrorMessageBase");
async function missingField(fields, body) {
    const missingFields = fields.filter((field) => !body[field]);
    if(missingFields.length > 0){
        throw ApiError.ValidationError([{ field: missingFields.join(", "), message: ErrorMessageBase.format(ErrorMessageBase.missingFields,"") }]);
    }
    return missingFields;
}
module.exports = missingField;