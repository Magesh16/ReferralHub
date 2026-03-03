// Company tiers for price prediction
const COMPANY_TIERS = {
  TIER_1: {
    multiplier: 3.0,
    companies: [
      'google', 'meta', 'apple', 'amazon', 'microsoft', 'netflix',
      'nvidia', 'salesforce', 'adobe', 'uber', 'airbnb', 'stripe',
      'databricks', 'snowflake', 'palantir',
    ],
  },
  TIER_2: {
    multiplier: 2.0,
    companies: [
      'flipkart', 'razorpay', 'phonepe', 'swiggy', 'zomato', 'ola',
      'cred', 'meesho', 'groww', 'zerodha', 'dream11', 'paytm',
      'atlassian', 'oracle', 'sap', 'vmware', 'ibm', 'cisco',
      'intuit', 'servicenow', 'shopify', 'twilio',
    ],
  },
  TIER_3: {
    multiplier: 1.5,
    companies: [
      'infosys', 'tcs', 'wipro', 'hcl', 'cognizant', 'accenture',
      'capgemini', 'deloitte', 'ey', 'kpmg', 'pwc', 'zoho',
    ],
  },
};

// Role levels for price prediction
const ROLE_LEVELS = {
  intern: 0.7,
  junior: 1.0,
  mid: 1.5,
  senior: 2.0,
  lead: 2.5,
  principal: 3.0,
  manager: 2.0,
  director: 3.0,
  vp: 3.5,
};

// Appointment statuses
const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  REFERRED: 'referred',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// Referral post statuses
const REFERRAL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
  EXPIRED: 'expired',
};

// Notification types
const NOTIFICATION_TYPES = {
  BOOKING_NEW: 'booking_new',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  REFERRAL_SUBMITTED: 'referral_submitted',
  PAYMENT_HELD: 'payment_held',
  PAYMENT_RELEASED: 'payment_released',
  PAYMENT_REFUNDED: 'payment_refunded',
  REMINDER: 'reminder',
  SYSTEM: 'system',
};

module.exports = {
  COMPANY_TIERS,
  ROLE_LEVELS,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  REFERRAL_STATUS,
  NOTIFICATION_TYPES,
};
