const db = require('../db');
const { ELIGIBILITY_TAGS, CATEGORIES } = require('../constants');

function parse(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    eligibility: JSON.parse(row.eligibility || '[]'),
    studentVerified: !!row.student_verified,
    location: row.location,
    categories: JSON.parse(row.categories || '[]'),
    onboarded: !!row.onboarded,
    createdAt: row.created_at,
  };
}

// Strip the password hash before sending to clients.
function toPublic(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function isEduEmail(email) {
  return /\.edu$/i.test(String(email).trim());
}

const stmts = {
  byId: db.prepare('SELECT * FROM users WHERE id = ?'),
  byEmail: db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)'),
  insert: db.prepare(`
    INSERT INTO users (name, email, password_hash, eligibility, student_verified, location, categories)
    VALUES (@name, @email, @passwordHash, @eligibility, @studentVerified, @location, @categories)
  `),
  updateProfile: db.prepare(`
    UPDATE users
    SET eligibility = @eligibility,
        location = @location,
        categories = @categories,
        student_verified = @studentVerified,
        onboarded = 1
    WHERE id = @id
  `),
};

const User = {
  isEduEmail,
  toPublic,

  findById(id) {
    return parse(stmts.byId.get(id));
  },

  findByEmail(email) {
    return parse(stmts.byEmail.get(email));
  },

  create({ name, email, passwordHash }) {
    const studentVerified = isEduEmail(email);
    const result = stmts.insert.run({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      eligibility: JSON.stringify(studentVerified ? ['Student'] : []),
      studentVerified: studentVerified ? 1 : 0,
      location: 'Pittsburgh, PA',
      categories: JSON.stringify([]),
    });
    return User.findById(result.lastInsertRowid);
  },

  updateProfile(id, { eligibility = [], location, categories = [], studentEmail }) {
    const current = User.findById(id);
    if (!current) return null;

    const cleanEligibility = [...new Set(eligibility.filter((t) => ELIGIBILITY_TAGS.includes(t)))];
    const cleanCategories = [...new Set(categories.filter((c) => CATEGORIES.includes(c)))];

    // Student verification: a .edu account email or a provided .edu email verifies the student tag.
    // Only the boolean outcome is stored; the secondary email is never persisted.
    let studentVerified = current.studentVerified || isEduEmail(current.email);
    if (cleanEligibility.includes('Student') && studentEmail && isEduEmail(studentEmail)) {
      studentVerified = true;
    }

    stmts.updateProfile.run({
      id,
      eligibility: JSON.stringify(cleanEligibility),
      location: (location || 'Pittsburgh, PA').trim().slice(0, 120),
      categories: JSON.stringify(cleanCategories),
      studentVerified: studentVerified ? 1 : 0,
    });
    return User.findById(id);
  },
};

module.exports = User;
