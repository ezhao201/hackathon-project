const db = require('../db');
const { ELIGIBILITY_LABELS } = require('../constants');

function parse(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    description: row.description,
    category: row.category,
    eligibility: JSON.parse(row.eligibility || '[]'),
    location: row.location,
    expiry: row.expiry,
    link: row.link,
    estimatedSavings: row.estimated_savings,
    keywords: row.keywords,
    popularity: row.popularity,
    createdAt: row.created_at,
  };
}

const stmts = {
  all: db.prepare('SELECT * FROM discounts ORDER BY id ASC'),
  byId: db.prepare('SELECT * FROM discounts WHERE id = ?'),
  search: db.prepare(`
    SELECT * FROM discounts
    WHERE lower(title) LIKE @q
       OR lower(brand) LIKE @q
       OR lower(description) LIKE @q
       OR lower(category) LIKE @q
       OR lower(keywords) LIKE @q
    ORDER BY popularity DESC
  `),
  insert: db.prepare(`
    INSERT INTO discounts (id, title, brand, description, category, eligibility, location, expiry, link, estimated_savings, keywords, popularity)
    VALUES (@id, @title, @brand, @description, @category, @eligibility, @location, @expiry, @link, @estimatedSavings, @keywords, @popularity)
  `),
  deleteAll: db.prepare('DELETE FROM discounts'),
  bumpPopularity: db.prepare('UPDATE discounts SET popularity = popularity + 1 WHERE id = ?'),
};

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${dateStr}T00:00:00`);
  return Math.round((expiry - today) / 86400000);
}

/**
 * A user qualifies when they hold at least one of the discount's eligibility tags.
 * Returns { eligible, matchedTags, missingTags, reason }.
 */
function evaluateEligibility(discount, user) {
  const userTags = new Set(user?.eligibility || []);
  const required = discount.eligibility || [];
  if (required.length === 0) {
    return { eligible: true, matchedTags: [], missingTags: [], reason: null };
  }
  const matchedTags = required.filter((t) => userTags.has(t));
  const missingTags = required.filter((t) => !userTags.has(t));
  if (matchedTags.length > 0) {
    return { eligible: true, matchedTags, missingTags, reason: null };
  }
  const labels = required.map((t) => ELIGIBILITY_LABELS[t] || t);
  const reason =
    labels.length === 1
      ? `Requires: ${labels[0]}. Your profile doesn't include this tag.`
      : `Requires one of: ${labels.join(', ')}. Your profile doesn't include any of these tags.`;
  return { eligible: false, matchedTags, missingTags, reason };
}

function decorate(discount, user, claimedIds = new Set()) {
  const eligibilityCheck = evaluateEligibility(discount, user);
  const days = daysUntil(discount.expiry);
  return {
    ...discount,
    eligible: eligibilityCheck.eligible,
    matchedTags: eligibilityCheck.matchedTags,
    ineligibleReason: eligibilityCheck.reason,
    eligibilityLabel: discount.eligibility.map((t) => ELIGIBILITY_LABELS[t] || t).join(' or ') || 'Everyone',
    daysUntilExpiry: days,
    isExpired: days < 0,
    expiringSoon: days >= 0 && days <= 7,
    claimed: claimedIds.has(discount.id),
  };
}

const Discount = {
  daysUntil,
  evaluateEligibility,
  decorate,

  all() {
    return stmts.all.all().map(parse);
  },

  findById(id) {
    return parse(stmts.byId.get(id));
  },

  search(query) {
    const q = `%${String(query).toLowerCase().trim()}%`;
    return stmts.search.all({ q }).map(parse);
  },

  insert(d) {
    stmts.insert.run({
      id: d.id,
      title: d.title,
      brand: d.brand,
      description: d.description,
      category: d.category,
      eligibility: JSON.stringify(d.eligibility || []),
      location: d.location || 'Online',
      expiry: d.expiry,
      link: d.link || '#',
      estimatedSavings: d.estimatedSavings ?? 0,
      keywords: d.keywords || '',
      popularity: d.popularity ?? 0,
    });
  },

  deleteAll() {
    stmts.deleteAll.run();
  },

  bumpPopularity(id) {
    stmts.bumpPopularity.run(id);
  },
};

module.exports = Discount;
