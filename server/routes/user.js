const express = require('express');
const User = require('../models/User');
const ClaimedDeal = require('../models/ClaimedDeal');
const { requireAuth } = require('../middleware/auth');
const { ELIGIBILITY_TAGS, CATEGORIES, ELIGIBILITY_LABELS } = require('../constants');

const router = express.Router();
router.use(requireAuth);

// GET /api/user/profile
router.get('/profile', (req, res) => {
  res.json({
    user: User.toPublic(req.user),
    options: { eligibilityTags: ELIGIBILITY_TAGS, categories: CATEGORIES, labels: ELIGIBILITY_LABELS },
  });
});

// PUT /api/user/profile
router.put('/profile', (req, res) => {
  const { eligibility, location, categories, studentEmail } = req.body || {};

  if (eligibility !== undefined && !Array.isArray(eligibility)) {
    return res.status(400).json({ error: 'eligibility must be an array' });
  }
  if (categories !== undefined && !Array.isArray(categories)) {
    return res.status(400).json({ error: 'categories must be an array' });
  }
  if (Array.isArray(eligibility) && eligibility.includes('Student')) {
    const accountIsEdu = User.isEduEmail(req.user.email);
    if (!accountIsEdu && !req.user.studentVerified && !(studentEmail && User.isEduEmail(studentEmail))) {
      return res.status(400).json({
        error: 'Student status requires a .edu email address for verification',
        field: 'studentEmail',
      });
    }
  }

  const user = User.updateProfile(req.user.id, {
    eligibility: eligibility || [],
    location,
    categories: categories || [],
    studentEmail,
  });
  res.json({ user: User.toPublic(user) });
});

// ---------- Savings dashboard ----------

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeStreak(claims) {
  const days = new Set(claims.map((c) => dayKey(c.claimedAt)));
  if (days.size === 0) return 0;

  // Streak counts consecutive days ending today or yesterday (so a streak isn't lost mid-day).
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const BADGES = [
  { id: 'first-save', name: 'First Save', description: 'Claimed your first discount', test: (s) => s.totalClaims >= 1 },
  { id: 'five-deals', name: 'Deal Hunter', description: 'Claimed 5 deals', test: (s) => s.totalClaims >= 5 },
  { id: 'ten-deals', name: '10 Deals Claimed', description: 'Claimed 10 deals', test: (s) => s.totalClaims >= 10 },
  { id: 'super-saver', name: 'Super Saver', description: 'Saved $100+ in total', test: (s) => s.totalSaved >= 100 },
  { id: 'streak-3', name: 'On a Roll', description: '3-day savings streak', test: (s) => s.streak >= 3 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day savings streak', test: (s) => s.streak >= 7 },
  { id: 'explorer', name: 'Category Explorer', description: 'Saved in 3+ categories', test: (s) => s.categoriesUsed >= 3 },
  { id: 'local-legend', name: 'Local Legend', description: 'Claimed a Pittsburgh deal', test: (s) => s.localClaims >= 1 },
];

// GET /api/user/savings
router.get('/savings', (req, res) => {
  const claims = ClaimedDeal.forUser(req.user.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalSaved = claims.reduce((sum, c) => sum + c.amountSaved, 0);
  const monthClaims = claims.filter((c) => new Date(c.claimedAt) >= monthStart);
  const savedThisMonth = monthClaims.reduce((sum, c) => sum + c.amountSaved, 0);

  const byCategory = {};
  for (const cat of [...CATEGORIES, 'General']) byCategory[cat] = 0;
  for (const c of claims) {
    if (new Date(c.claimedAt) >= thirtyDaysAgo) {
      byCategory[c.category] = (byCategory[c.category] || 0) + c.amountSaved;
    }
  }
  const chart = Object.entries(byCategory).map(([category, amount]) => ({
    category,
    amount: Math.round(amount * 100) / 100,
  }));

  const streak = computeStreak(claims);
  const stats = {
    totalClaims: claims.length,
    totalSaved,
    savedThisMonth,
    claimsThisMonth: monthClaims.length,
    streak,
    categoriesUsed: new Set(claims.map((c) => c.category)).size,
    localClaims: claims.filter((c) => /pittsburgh/i.test(c.location || '')).length,
  };

  res.json({
    stats: {
      ...stats,
      totalSaved: Math.round(totalSaved * 100) / 100,
      savedThisMonth: Math.round(savedThisMonth * 100) / 100,
    },
    badges: BADGES.map(({ test, ...b }) => ({ ...b, earned: test(stats) })),
    chart,
    recentClaims: claims.slice(0, 10),
  });
});

module.exports = router;
