const { COMPANY_TIERS, ROLE_LEVELS } = require('../utils/constants');
const config = require('../config/env');
const ReferralPost = require('../models/ReferralPost');

/**
 * Get the company tier multiplier
 */
const getCompanyMultiplier = (company) => {
  const normalised = company.toLowerCase().trim();

  for (const tier of Object.values(COMPANY_TIERS)) {
    if (tier.companies.includes(normalised)) {
      return tier.multiplier;
    }
  }
  return 1.0; // default for unknown companies
};

/**
 * Get the role level multiplier
 */
const getRoleMultiplier = (role) => {
  const normalised = role.toLowerCase().trim();

  // Check for keywords in the role string
  for (const [level, multiplier] of Object.entries(ROLE_LEVELS)) {
    if (normalised.includes(level)) {
      return multiplier;
    }
  }

  // Default heuristics
  if (normalised.includes('staff') || normalised.includes('architect')) return 2.5;
  if (normalised.includes('head') || normalised.includes('cto') || normalised.includes('ceo')) return 3.5;

  return 1.0; // default
};

/**
 * Calculate demand factor based on existing bookings for the company + role
 */
const getDemandFactor = async (company, role) => {
  try {
    const activePostsCount = await ReferralPost.countDocuments({
      company: { $regex: new RegExp(company, 'i') },
      status: 'active',
    });

    const bookedCount = await ReferralPost.aggregate([
      {
        $match: {
          company: { $regex: new RegExp(company, 'i') },
          status: 'active',
        },
      },
      { $group: { _id: null, totalBooked: { $sum: '$bookedSlots' } } },
    ]);

    const totalBooked = bookedCount[0]?.totalBooked || 0;
    const totalSlots = activePostsCount * 5 || 1;

    // Scale between 1.0 and 2.0
    const ratio = Math.min(totalBooked / totalSlots, 1);
    return 1.0 + ratio;
  } catch {
    return 1.0;
  }
};

/**
 * Calculate experience factor
 * Scale: 1.0 to 2.0 based on years of experience
 */
const getExperienceFactor = (experienceYears) => {
  return Math.min(1 + experienceYears / 10, 2.0);
};

/**
 * Main price prediction function
 * @returns {number} The predicted referral price in INR
 */
const predictPrice = async ({ company, role, experienceMin = 0 }) => {
  const basePrice = config.baseReferralPrice;
  const companyMultiplier = getCompanyMultiplier(company);
  const roleMultiplier = getRoleMultiplier(role);
  const demandFactor = await getDemandFactor(company, role);
  const experienceFactor = getExperienceFactor(experienceMin);

  const predicted = Math.round(
    basePrice * companyMultiplier * roleMultiplier * demandFactor * experienceFactor
  );

  return {
    predictedPrice: predicted,
    breakdown: {
      basePrice,
      companyMultiplier,
      roleMultiplier,
      demandFactor: Math.round(demandFactor * 100) / 100,
      experienceFactor: Math.round(experienceFactor * 100) / 100,
    },
  };
};

module.exports = { predictPrice, getCompanyMultiplier, getRoleMultiplier };
