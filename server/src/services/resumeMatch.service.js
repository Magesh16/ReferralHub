/**
 * resumeMatch.service.js
 *
 * Token-efficient resume ↔ job matching using Gemini 1.5 Flash.
 *
 * Strategy:
 *   1. Bucket jobs into tech categories with a keyword map (ZERO tokens)
 *   2. Run Gemini ONLY for jobs in matching categories (or ALL if no category detected)
 *   3. Cache every (seeker, job) score in ResumeMatch — never recompute
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ResumeMatch = require('../models/ResumeMatch');
const ReferralPost = require('../models/ReferralPost');

// ── Tech category keyword map ─────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  MERN:     ['react', 'reactjs', 'node', 'nodejs', 'express', 'mongodb', 'mongoose', 'mern', 'next.js', 'nextjs'],
  Java:     ['java', 'spring', 'springboot', 'hibernate', 'maven', 'gradle', 'j2ee', 'jvm', 'spring boot'],
  Frontend: ['html', 'css', 'javascript', 'typescript', 'vue', 'angular', 'svelte', 'webpack', 'frontend'],
  Backend:  ['python', 'django', 'flask', 'fastapi', 'ruby', 'rails', 'php', 'laravel', 'go', 'golang', 'rust', 'backend'],
  Data:     ['sql', 'postgresql', 'mysql', 'data science', 'machine learning', 'tensorflow', 'pytorch', 'pandas', 'spark', 'kafka', 'airflow', 'data engineer'],
  Mobile:   ['ios', 'android', 'swift', 'kotlin', 'flutter', 'react native', 'xamarin', 'mobile'],
  DevOps:   ['docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'terraform', 'ansible', 'ci/cd', 'jenkins', 'devops'],
};

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = geminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

// ── Assign a tech category to a referral post based on its skills + role ─
function assignCategory(post) {
  const text = [post.role, post.description, ...(post.skills || [])].join(' ').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return cat;
  }
  return 'Other';
}

// ── Detect which categories a seeker's resume and skills fall into ────────
function detectSeekerCategories(resumeText = '', skills = []) {
  const text = [resumeText, ...skills].join(' ').toLowerCase();
  if (!text.trim()) return [];
  const matched = [];
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) matched.push(cat);
  }
  return matched;
}

// ── Call Gemini to score one resume vs one job ────────────────────────────
async function scoreWithGemini(resumeText, post) {
  const jdSummary = [
    `Role: ${post.role} at ${post.company}`,
    `Required Skills: ${(post.skills || []).join(', ')}`,
    post.experienceMin != null ? `Experience: ${post.experienceMin}-${post.experienceMax} years` : '',
    post.description ? `Description: ${post.description.slice(0, 500)}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const resumeSnippet = resumeText.slice(0, 2500);

  const prompt = `You are a technical recruiter. Analyze this resume snippet against the job description and return ONLY valid JSON.

RESUME SNIPPET:
${resumeSnippet}

JOB DESCRIPTION:
${jdSummary}

Return this EXACT JSON (no markdown, no explanation):
{"score":<integer 0-100>,"reasons":["<reason1>","<reason2>","<reason3>"],"missingSkills":["<skill1>","<skill2>"]}

Scoring rules:
- 80-100: strong match (3+ required skills present, experience fits)
- 50-79: partial match (1-2 skills present, some gaps)
- 0-49: weak match or very different domain`;

  try {
    const response = await model.generateContent(prompt);
    const raw = response.response.text().trim();
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
    const result = JSON.parse(jsonStr);
    return {
      score: Math.min(100, Math.max(0, Math.round(result.score || 0))),
      reasons: (result.reasons || []).slice(0, 3),
      missingSkills: (result.missingSkills || []).slice(0, 3),
    };
  } catch (err) {
    // Detect quota exhausted — throw so we don't cache a fake score
    if (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('Too Many Requests'))) {
      throw new Error('QUOTA_EXCEEDED: Gemini API free-tier daily quota exhausted. Please try again tomorrow or upgrade your plan at https://ai.google.dev');
    }
    // Detect model not found
    if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
      throw new Error('MODEL_NOT_FOUND: Gemini model not found. Update GEMINI_MODEL in server/.env to gemini-2.0-flash');
    }
    console.error('[Gemini] Unexpected error:', err.message);
    // Only return fallback for genuine parse errors (not API errors)
    return { score: 50, reasons: ['AI analysis temporarily unavailable'], missingSkills: [] };
  }
}

/**
 * Compute and cache match scores for a seeker against active referral posts.
 *
 * Token-efficiency strategy:
 *   - If seeker has recognisable tech categories → only score posts in those categories
 *   - If no categories detected (empty resume / skills) → score all active posts (up to 20)
 */
async function computeMatchesForSeeker(seekerId, resumeText = '', skills = []) {
  const seekerCategories = detectSeekerCategories(resumeText, skills);
  console.log(`[ResumeMatch] Seeker ${seekerId} — detected categories: ${seekerCategories.length ? seekerCategories.join(', ') : 'none (will use skills-only)'}`);

  // Build query — if we detected categories, use them; otherwise get all active posts
  let query = { status: 'active' };
  if (seekerCategories.length > 0) {
    // Include posts matching seeker's categories OR uncategorised posts
    query.techCategory = { $in: [...seekerCategories, 'Other', null, undefined] };
  }

  let posts = await ReferralPost.find(query).lean();

  // Safety cap — never send more than 25 posts to Gemini per run
  if (posts.length > 25) {
    posts = posts.slice(0, 25);
  }

  console.log(`[ResumeMatch] Found ${posts.length} candidate posts`);
  if (posts.length === 0) return [];

  // Find already-cached matches for this seeker
  const cached = await ResumeMatch.find({
    seeker: seekerId,
    referralPost: { $in: posts.map((p) => p._id) },
  }).lean();
  const cachedSet = new Set(cached.map((c) => c.referralPost.toString()));

  const pending = posts.filter((p) => !cachedSet.has(p._id.toString()));
  console.log(`[ResumeMatch] ${pending.length} posts to score, ${cached.length} already cached`);

  // Build a combined "profile" text for scoring — use skills as fallback if resume is thin
  const profileText = resumeText && resumeText.trim().length > 50
    ? resumeText
    : `Skills: ${skills.join(', ')}. Looking for software engineering roles.`;

  const newMatches = [];
  for (const post of pending) {
    try {
      const { score, reasons, missingSkills } = await scoreWithGemini(profileText, post);
      const match = await ResumeMatch.findOneAndUpdate(
        { seeker: seekerId, referralPost: post._id },
        {
          seeker: seekerId,
          referralPost: post._id,
          score,
          reasons,
          missingSkills,
          techCategory: post.techCategory || assignCategory(post),
          computedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      newMatches.push(match);
      console.log(`[ResumeMatch] Scored "${post.role}" at ${post.company}: ${score}/100`);
    } catch (err) {
      console.error(`[ResumeMatch] Failed for post ${post._id}:`, err.message);
    }
  }

  return [...cached, ...newMatches];
}

/**
 * Get a single on-demand match score for (seeker, referralPost).
 */
async function getOrComputeMatchScore(seekerId, referralPostId, resumeText = '', skills = []) {
  const existing = await ResumeMatch.findOne({ seeker: seekerId, referralPost: referralPostId });
  if (existing) return existing;

  const profileText = resumeText && resumeText.trim().length > 50
    ? resumeText
    : skills.length > 0 ? `Skills: ${skills.join(', ')}.` : null;

  if (!profileText) return null;

  const post = await ReferralPost.findById(referralPostId).lean();
  if (!post) return null;

  const { score, reasons, missingSkills } = await scoreWithGemini(profileText, post);
  return ResumeMatch.findOneAndUpdate(
    { seeker: seekerId, referralPost: referralPostId },
    {
      seeker: seekerId,
      referralPost: referralPostId,
      score,
      reasons,
      missingSkills,
      techCategory: post.techCategory || assignCategory(post),
      computedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

module.exports = { computeMatchesForSeeker, getOrComputeMatchScore, assignCategory, detectSeekerCategories };
