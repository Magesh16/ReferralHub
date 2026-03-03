const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

/**
 * Middleware to check express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, 'Validation failed', 422, messages);
  }
  next();
};

module.exports = { validate };
