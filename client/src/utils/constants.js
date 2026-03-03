// ─── Job & Experience ──────────────────────────────────────────────────────
export const EXPERIENCE_OPTIONS = [
  { label: 'Fresher (0-1 yr)', min: 0, max: 1 },
  { label: '1-3 years', min: 1, max: 3 },
  { label: '3-5 years', min: 3, max: 5 },
  { label: '5-8 years', min: 5, max: 8 },
  { label: '8+ years', min: 8, max: 99 },
];

export const JOB_TYPES = ['full-time', 'contract', 'internship'];

// ─── Popular Autofill Lists ────────────────────────────────────────────────
export const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'Flipkart', 'Razorpay', 'Swiggy', 'Zomato', 'PhonePe',
  'Infosys', 'TCS', 'Wipro', 'HCL', 'Cognizant',
  'Salesforce', 'Adobe', 'Atlassian', 'Stripe', 'Airbnb',
];

export const POPULAR_ROLES = [
  'Software Engineer', 'SDE-1', 'SDE-2', 'Senior SDE', 'Staff Engineer',
  'Product Manager', 'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'Cloud Engineer', 'QA Engineer', 'Technical Lead',
];

export const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'GCP', 'Azure',
  'Docker', 'Kubernetes', 'GraphQL', 'REST APIs', 'Git', 'Go', 'Rust',
  'Angular', 'Vue.js', 'Next.js', 'Express.js', 'Spring Boot', 'Django',
];

// ─── Tech Categories (for AI bucketing) ───────────────────────────────────
export const TECH_CATEGORIES = [
  'All', 'MERN', 'Java', 'Frontend', 'Backend', 'Data', 'Mobile', 'DevOps',
];

// ─── Nav Links ─────────────────────────────────────────────────────────────
export const NAV_ITEMS_EMPLOYEE = [
  { path: '/employee/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/employee/referrals', label: 'My Referrals', icon: 'list' },
  { path: '/employee/appointments', label: 'Appointments', icon: 'calendar' },
  { path: '/profile', label: 'Profile', icon: 'user' },
];

export const NAV_ITEMS_SEEKER = [
  { path: '/seeker/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/seeker/browse', label: 'Browse', icon: 'search' },
  { path: '/seeker/matched', label: 'Best Matches 🤖', icon: 'brain' },
  { path: '/seeker/bookings', label: 'My Bookings', icon: 'bookmark' },
  { path: '/profile', label: 'Profile', icon: 'user' },
];

// ─── Appointment Status colours ────────────────────────────────────────────
export const STATUS_META = {
  pending:   { label: 'Pending',    color: '#FFB300', bg: 'rgba(255,179,0,0.12)' },
  confirmed: { label: 'Confirmed',  color: '#00E676', bg: 'rgba(0,230,118,0.12)' },
  completed: { label: 'Completed',  color: '#00D9FF', bg: 'rgba(0,217,255,0.12)' },
  referred:  { label: 'Referred ✅', color: '#00E676', bg: 'rgba(0,230,118,0.12)' },
  rejected:  { label: 'Rejected',   color: '#FF5252', bg: 'rgba(255,82,82,0.12)' },
  cancelled: { label: 'Cancelled',  color: '#9B9EC7', bg: 'rgba(155,158,199,0.12)' },
  active:    { label: 'Active',     color: '#00E676', bg: 'rgba(0,230,118,0.12)' },
  paused:    { label: 'Paused',     color: '#FFB300', bg: 'rgba(255,179,0,0.12)' },
  closed:    { label: 'Closed',     color: '#FF5252', bg: 'rgba(255,82,82,0.12)' },
};
