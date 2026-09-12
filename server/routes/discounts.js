const express = require('express');
const Discount = require('../models/Discount');
const ClaimedDeal = require('../models/ClaimedDeal');
const { requireAuth } = require('../middleware/auth');
const { CATEGORIES } = require('../constants');

const router = express.Router();
router.use(requireAuth);

function sortDiscounts(list, sort) {
  const copy = [...list];
  switch (sort) {
    case 'expiring':
      return copy.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    case 'popular':
      return copy.sort((a, b) => b.popularity - a.popularity || a.daysUntilExpiry - b.daysUntilExpiry);
    case 'newest':
    default:
      return copy.sort((a, b) => b.id - a.id);
  }
}

// GET /api/discounts/feed?category=Food&sort=newest&includeExpired=false
// Personalized feed: only discounts the current user qualifies for.
router.get('/feed', (req, res) => {
  const { category = 'All', sort = 'newest', includeExpired = 'false' } = req.query;
  const claimedIds = ClaimedDeal.claimedIdSet(req.user.id);
  const categoryFilter = category && category !== 'All' && CATEGORIES.includes(category) ? category : null;

  const all = Discount.all().map((d) => Discount.decorate(d, req.user, claimedIds));
  let items = all.filter((d) => d.eligible);

  if (categoryFilter) items = items.filter((d) => d.category === categoryFilter);
  if (includeExpired !== 'true') items = items.filter((d) => !d.isExpired);

  // When nothing matches, tell the client which eligibility tags would unlock deals in this view.
  const userTags = new Set(req.user.eligibility);
  const suggestionCounts = {};
  for (const d of all) {
    if (d.eligible || d.isExpired) continue;
    if (categoryFilter && d.category !== categoryFilter) continue;
    for (const tag of d.eligibility) {
      if (!userTags.has(tag)) suggestionCounts[tag] = (suggestionCounts[tag] || 0) + 1;
    }
  }
  const suggestions = Object.entries(suggestionCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    items: sortDiscounts(items, sort),
    meta: {
      total: items.length,
      categories: ['All', ...CATEGORIES],
      profileTags: req.user.eligibility,
      suggestions,
    },
  });
});

// GET /api/discounts/search?q=laptop
// Returns everything matching the query; ineligible results carry a reason for the tooltip.
router.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  const claimedIds = ClaimedDeal.claimedIdSet(req.user.id);
  const source = q ? Discount.search(q) : Discount.all();

  const items = source
    .map((d) => Discount.decorate(d, req.user, claimedIds))
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
      return b.popularity - a.popularity;
    });

  res.json({
    query: q,
    items,
    meta: {
      total: items.length,
      eligible: items.filter((d) => d.eligible).length,
    },
  });
});

// POST /api/discounts/match-count { eligibility: [...] }
// Preview how many live discounts a hypothetical set of tags would unlock (used while editing the profile).
router.post('/match-count', (req, res) => {
  const eligibility = Array.isArray(req.body?.eligibility) ? req.body.eligibility : [];
  const count = Discount.all().filter(
    (d) => Discount.daysUntil(d.expiry) >= 0 && Discount.evaluateEligibility(d, { eligibility }).eligible,
  ).length;
  res.json({ count });
});

// GET /api/discounts/alerts — eligible, unclaimed-or-claimed deals expiring within 7 days
router.get('/alerts', (req, res) => {
  const claimedIds = ClaimedDeal.claimedIdSet(req.user.id);
  const items = Discount.all()
    .map((d) => Discount.decorate(d, req.user, claimedIds))
    .filter((d) => d.eligible && d.expiringSoon)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  res.json({ items, count: items.length });
});

// GET /api/discounts/:id
router.get('/:id', (req, res) => {
  const discount = Discount.findById(Number(req.params.id));
  if (!discount) return res.status(404).json({ error: 'Discount not found' });
  const claimedIds = ClaimedDeal.claimedIdSet(req.user.id);
  res.json({ item: Discount.decorate(discount, req.user, claimedIds) });
});

// POST /api/discounts/:id/claim
router.post('/:id/claim', (req, res) => {
  const discount = Discount.findById(Number(req.params.id));
  if (!discount) return res.status(404).json({ error: 'Discount not found' });

  const check = Discount.evaluateEligibility(discount, req.user);
  if (!check.eligible) {
    return res.status(403).json({ error: 'You are not eligible for this discount', reason: check.reason });
  }
  if (Discount.daysUntil(discount.expiry) < 0) {
    return res.status(410).json({ error: 'This discount has expired' });
  }
  if (ClaimedDeal.exists(req.user.id, discount.id)) {
    return res.status(409).json({ error: 'You have already claimed this discount' });
  }

  ClaimedDeal.create({
    userId: req.user.id,
    discountId: discount.id,
    amountSaved: discount.estimatedSavings,
  });
  Discount.bumpPopularity(discount.id);

  const claimedIds = ClaimedDeal.claimedIdSet(req.user.id);
  res.status(201).json({
    message: 'Discount claimed',
    item: Discount.decorate(Discount.findById(discount.id), req.user, claimedIds),
  });
});

module.exports = router;
