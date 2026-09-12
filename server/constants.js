const ELIGIBILITY_TAGS = [
  'Student',
  'Veteran',
  'Senior',
  'Healthcare Worker',
  'Teacher',
  'Low-income',
  'CMU Affiliate',
];

const CATEGORIES = ['Food', 'Tech', 'Transport', 'Entertainment', 'Health'];

// "General" discounts have no category preference but still require eligibility.
const ALL_DISCOUNT_CATEGORIES = [...CATEGORIES, 'General'];

const ELIGIBILITY_LABELS = {
  Student: 'Students Only',
  Veteran: 'Veterans / Military',
  Senior: 'Seniors 65+',
  'Healthcare Worker': 'Healthcare Workers',
  Teacher: 'Teachers / Educators',
  'Low-income': 'SNAP / EBT Eligible',
  'CMU Affiliate': 'CMU Affiliates',
};

module.exports = { ELIGIBILITY_TAGS, CATEGORIES, ALL_DISCOUNT_CATEGORIES, ELIGIBILITY_LABELS };
