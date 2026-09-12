# KEMMDiscount

**Discounts You Actually Qualify For.**

KEMMDiscount is a profile-based discount eligibility engine. Instead of a wall of coupons, it asks who you are
(student, veteran, senior, healthcare worker, teacher, SNAP/EBT eligible, CMU affiliate) and shows you only the
deals you personally qualify for.

## Tech stack

| Layer    | Choice                                              |
| -------- | --------------------------------------------------- |
| Frontend | React 19 + Vite + Tailwind CSS + React Router + Recharts |
| Backend  | Node.js + Express 5                                 |
| Database | SQLite via Node's built-in `node:sqlite` (no native build step) |
| Auth     | JWT (bcrypt password hashing)                       |

## Project structure

```
/client                → React frontend
/server                → Express backend
/server/models         → User, Discount, ClaimedDeal data-access models
/server/routes         → auth.js, discounts.js, user.js
/server/middleware     → JWT auth middleware
/server/seed.js        → Seeds the database with mock discounts
```

## Getting started

Requires **Node.js 22.13 or newer** (Node 24 recommended). No Python or C++ build tools are needed.

On Windows PowerShell, run each command on its own line (`&&` is not supported in PowerShell 5.1).

```bash
# 1. Install dependencies for both apps (and the root dev helper)
npm install
npm run install:all

# 2. Seed the database (also happens automatically on first server start)
npm run seed

# 3. Run backend (http://localhost:5000) and frontend (http://localhost:5173) together
npm run dev
```

### Demo login

A demo account is created automatically on server start:

- **Email:** `demo@andrew.cmu.edu`
- **Password:** `password123`

It's a verified student / CMU affiliate with a few pre-claimed deals so the savings dashboard has data.
The login page also has a "Use demo account" button that fills these in.

Or run them separately: `npm run dev --prefix server` and `npm run dev --prefix client`.
The Vite dev server proxies `/api/*` to the Express server.

### Production build

```bash
npm run build      # builds client/dist
npm start          # Express serves the API and the built client on :5000
```

### Environment variables (`server/.env`)

See `server/.env.example`. `JWT_SECRET` should be set to a long random string in any real deployment.

## Features

- **Landing page** — hero, three-step explainer (Create Profile → Get Matched → Save Money), privacy messaging.
- **Auth** — register / login with JWT. `.edu` emails are auto-tagged **Student verified**.
- **Onboarding / profile** — multi-select eligibility tags (Student requires a `.edu` email), location preference
  (defaults to Pittsburgh, PA / CMU area) and preferred categories. Shows "We never sell your data."
- **Personalized feed** — only eligible discounts; category filter bar (All / Food / Tech / Transport /
  Entertainment / Health); sort by Newest / Expiring Soon / Most Popular; one-tap Claim.
- **Search** — search by product or store name. Ineligible matches are grayed out with a tooltip explaining
  which eligibility tag is missing.
- **Savings dashboard** — money saved this month, savings streak, badges, and a 30-day savings-by-category bar chart.
- **Expiry alerts** — navbar bell with a badge count and a list of eligible deals expiring within 7 days.

## Privacy

Only the following is stored per user: name, email, password hash, selected eligibility tags, a boolean
"student verified" flag, location preference and preferred categories. A secondary `.edu` address entered for
student verification is checked and discarded — it is never persisted.

## API overview

| Method | Path                          | Auth | Description                                   |
| ------ | ----------------------------- | ---- | --------------------------------------------- |
| POST   | `/api/auth/register`          | –    | Create account, returns JWT                   |
| POST   | `/api/auth/login`             | –    | Login, returns JWT                            |
| GET    | `/api/auth/me`                | ✓    | Current user                                  |
| GET    | `/api/user/profile`           | ✓    | Profile + option lists                        |
| PUT    | `/api/user/profile`           | ✓    | Update eligibility / location / categories    |
| GET    | `/api/user/savings`           | ✓    | Savings stats, streak, badges, chart data     |
| GET    | `/api/discounts/feed`         | ✓    | Eligible discounts (`category`, `sort`, `includeExpired`) |
| GET    | `/api/discounts/search?q=`    | ✓    | All matches with eligibility flags + reasons  |
| GET    | `/api/discounts/alerts`       | ✓    | Eligible discounts expiring within 7 days     |
| POST   | `/api/discounts/:id/claim`    | ✓    | Claim a discount                              |

## Seed data

`server/seed.js` contains the six mock discounts from the product brief verbatim (ids 1–6) plus 14 supplementary
deals with relative expiry dates so every eligibility group and the expiry-alert bell have live examples.
Expired deals are hidden from the feed by default and can be revealed with the "Show expired deals" toggle.
