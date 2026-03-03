const ReferralPost = require('../models/ReferralPost');
const { predictPrice } = require('../services/pricePrediction.service');
const { successResponse, errorResponse, buildPagination } = require('../utils/helpers');
const { assignCategory } = require('../services/resumeMatch.service');

/**
 * POST /api/referrals
 * Create a referral post (employee only)
 */
const createReferral = async (req, res, next) => {
  try {
    const {
      company, role, department, experienceMin, experienceMax,
      skills, description, location, jobType, maxSlots,
      availableFrom, availableTo,
    } = req.body;

    // Get predicted price
    const { predictedPrice } = await predictPrice({ company, role, experienceMin });

    // Auto-assign tech category (keyword-based, zero API cost)
    const techCategory = assignCategory({ role, description, skills: skills || [] });

    const referral = await ReferralPost.create({
      employee: req.user._id,
      company,
      role,
      department,
      experienceMin,
      experienceMax,
      skills: skills || [],
      description,
      location,
      jobType,
      predictedPrice,
      finalPrice: predictedPrice,
      techCategory,
      maxSlots: maxSlots || 5,
      availableFrom: availableFrom || new Date(),
      availableTo: availableTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return successResponse(res, referral, 'Referral post created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals
 * Browse referrals with filters and pagination
 */
const getReferrals = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      company, role, skills, jobType, location,
      minPrice, maxPrice, minExp, maxExp,
      sortBy = 'createdAt', order = 'desc',
      search,
    } = req.query;

    const query = { status: 'active' };

    if (company) query.company = { $regex: new RegExp(company, 'i') };
    if (role) query.role = { $regex: new RegExp(role, 'i') };
    if (jobType) query.jobType = jobType;
    if (location) query.location = { $regex: new RegExp(location, 'i') };

    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillArr };
    }

    if (minPrice || maxPrice) {
      query.predictedPrice = {};
      if (minPrice) query.predictedPrice.$gte = Number(minPrice);
      if (maxPrice) query.predictedPrice.$lte = Number(maxPrice);
    }

    if (minExp || maxExp) {
      if (minExp) query.experienceMin = { $lte: Number(minExp) };
      if (maxExp) query.experienceMax = { $gte: Number(maxExp) };
    }

    if (search) {
      query.$or = [
        { company: { $regex: new RegExp(search, 'i') } },
        { role: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [referrals, totalDocs] = await Promise.all([
      ReferralPost.find(query)
        .populate('employee', 'name avatar company jobTitle avgRating totalReferrals successRate')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ReferralPost.countDocuments(query),
    ]);

    const pagination = buildPagination(Number(page), Number(limit), totalDocs);

    return successResponse(res, { referrals, pagination }, 'Referrals fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/my-posts
 * Employee's own referral posts
 */
const getMyReferrals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { employee: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [referrals, totalDocs] = await Promise.all([
      ReferralPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ReferralPost.countDocuments(query),
    ]);

    const pagination = buildPagination(Number(page), Number(limit), totalDocs);

    return successResponse(res, { referrals, pagination }, 'My referrals fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/:id
 */
const getReferralById = async (req, res, next) => {
  try {
    const referral = await ReferralPost.findById(req.params.id)
      .populate('employee', 'name avatar company jobTitle avgRating totalReferrals successRate linkedinUrl');

    if (!referral) {
      return errorResponse(res, 'Referral post not found', 404);
    }

    // Increment views
    referral.totalViews += 1;
    await referral.save();

    return successResponse(res, referral, 'Referral fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/referrals/:id
 */
const updateReferral = async (req, res, next) => {
  try {
    const referral = await ReferralPost.findById(req.params.id);

    if (!referral) {
      return errorResponse(res, 'Referral post not found', 404);
    }

    if (referral.employee.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this post', 403);
    }

    const allowedFields = [
      'role', 'department', 'experienceMin', 'experienceMax',
      'skills', 'description', 'location', 'jobType',
      'finalPrice', 'maxSlots', 'availableFrom', 'availableTo',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        referral[field] = req.body[field];
      }
    });

    await referral.save();
    return successResponse(res, referral, 'Referral updated');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/referrals/:id/status
 */
const updateReferralStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const referral = await ReferralPost.findById(req.params.id);

    if (!referral) {
      return errorResponse(res, 'Referral post not found', 404);
    }

    if (referral.employee.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized', 403);
    }

    referral.status = status;
    await referral.save();

    return successResponse(res, referral, `Referral ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/predict-price
 */
const getPredictedPrice = async (req, res, next) => {
  try {
    const { company, role, experienceMin } = req.query;

    if (!company || !role) {
      return errorResponse(res, 'Company and role are required', 400);
    }

    const result = await predictPrice({ company, role, experienceMin: Number(experienceMin) || 0 });
    return successResponse(res, result, 'Price predicted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReferral,
  getReferrals,
  getMyReferrals,
  getReferralById,
  updateReferral,
  updateReferralStatus,
  getPredictedPrice,
};
