const User = require('../models/User');
const config = require('../config/env');
const {
  generateAccessToken,
  generateRefreshToken,
  successResponse,
  errorResponse,
} = require('../utils/helpers');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, jobTitle, skills, experienceYears, currentRole } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409);
    }

    const userData = { name, email, password, role };

    // Employee-specific fields
    if (role === 'employee') {
      userData.company = company || '';
      userData.jobTitle = jobTitle || '';
    }

    // Seeker-specific fields
    if (role === 'seeker') {
      userData.skills = skills || [];
      userData.experienceYears = experienceYears || 0;
      userData.currentRole = currentRole || '';
    }

    const user = await User.create(userData);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(
      res,
      {
        user,
        accessToken,
        refreshToken,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(res, {
      user,
      accessToken,
      refreshToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required', 401);
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed');
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = '';
    await req.user.save();
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  return successResponse(res, req.user, 'Profile fetched');
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'avatar', 'company', 'jobTitle', 'department',
      'yearsAtCompany', 'linkedinUrl', 'resume', 'skills',
      'experienceYears', 'currentRole', 'preferredRoles', 'preferredCompanies',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshAccessToken, logout, getMe, updateProfile };
