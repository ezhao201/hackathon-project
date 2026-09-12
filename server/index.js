require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const discountRoutes = require('./routes/discounts');
const userRoutes = require('./routes/user');
const Discount = require('./models/Discount');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'KEMMDiscount API' }));
app.use('/api/auth', authRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/user', userRoutes);

// Serve the built React client in production.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => (err ? next() : undefined));
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Auto-seed an empty database so a fresh clone works out of the box,
// and make sure the demo login always exists.
const { seedDiscounts, seedDemoUser } = require('./seed');
if (Discount.all().length === 0) {
  const count = seedDiscounts();
  console.log(`Database was empty — seeded ${count} discounts`);
}
const demo = seedDemoUser();
console.log(`Demo login: ${demo.email} / ${demo.password}`);

app.listen(PORT, () => {
  console.log(`KEMMDiscount API listening on http://localhost:${PORT}`);
});
