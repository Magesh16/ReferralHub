const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Generate a JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  });
};

/**
 * Build pagination metadata for list responses
 */
const buildPagination = (page, limit, totalDocs) => {
  const totalPages = Math.ceil(totalDocs / limit);
  return {
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Standardised success response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standardised error response
 */
const errorResponse = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  buildPagination,
  successResponse,
  errorResponse,
};
