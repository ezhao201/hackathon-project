const db = require('../db');

function parse(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    discountId: row.discount_id,
    amountSaved: row.amount_saved,
    claimedAt: row.claimed_at,
    title: row.title,
    brand: row.brand,
    category: row.category,
    location: row.location,
  };
}

const stmts = {
  insert: db.prepare(`
    INSERT INTO claimed_deals (user_id, discount_id, amount_saved, claimed_at)
    VALUES (@userId, @discountId, @amountSaved, @claimedAt)
  `),
  byUser: db.prepare(`
    SELECT c.*, d.title, d.brand, d.category, d.location
    FROM claimed_deals c
    JOIN discounts d ON d.id = c.discount_id
    WHERE c.user_id = ?
    ORDER BY c.claimed_at DESC
  `),
  idsByUser: db.prepare('SELECT discount_id FROM claimed_deals WHERE user_id = ?'),
  exists: db.prepare('SELECT 1 FROM claimed_deals WHERE user_id = ? AND discount_id = ?'),
};

const ClaimedDeal = {
  create({ userId, discountId, amountSaved, claimedAt }) {
    const result = stmts.insert.run({
      userId,
      discountId,
      amountSaved,
      claimedAt: claimedAt || new Date().toISOString(),
    });
    return result.lastInsertRowid;
  },

  forUser(userId) {
    return stmts.byUser.all(userId).map(parse);
  },

  claimedIdSet(userId) {
    return new Set(stmts.idsByUser.all(userId).map((r) => r.discount_id));
  },

  exists(userId, discountId) {
    return !!stmts.exists.get(userId, discountId);
  },
};

module.exports = ClaimedDeal;
