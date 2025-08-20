// middleware/errorHandler.js
const ApiErrorResponse = require("../utils/ApiErrorResponse");

function errorHandler(err, req, res, next) {
  console.error("Global Error:", JSON.stringify({
    message: err.message,
    type: err.type,
    status: err.status,
    errors: err.errors
  }, null, 2));

  res.status(err.status || 500).json({
    success: false,
    type: err.type,
    status: err.status || 500,
    message: err.message,
    
    errors: err.errors || []
  });
}

module.exports = errorHandler;
