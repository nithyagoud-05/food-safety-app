# Annapurna

Food Safety Intelligence Platform.

Tagline: **Eat with confidence, not assumptions.**

Annapurna is a public-health-first restaurant transparency platform focused on ingredients, allergens, authenticated user reviews, consumer-reported food-safety concerns, and explainable Annapurna safety intelligence.

Annapurna is not an official FSSAI system and does not claim government verification or live regulatory data integration.

## Current Features

- JWT authentication with diner, restaurant owner, and admin roles
- Account statuses: active, pending, blocked
- Restaurant owner approval and admin assignment workflow
- Restaurant discovery and Hyderabad public-metadata profiles
- Menu transparency with major declared ingredients, allergens, dietary markers, availability, and data source labels
- Personalized allergy matching against ingredients and allergens
- Authenticated user reviews with one review per diner per restaurant
- Food-safety concern reporting into Annapurna moderation
- Public-safe incident history on restaurant detail pages
- Explainable Annapurna Safety Score with insufficient-data state for weak public signals
- Regulatory-style admin dashboard for owner approval, restaurant management, report triage, and review moderation
- Owner dashboard for assigned restaurant transparency and menu management

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT
- Image evidence storage: Cloudinary

MongoDB is required. There is no in-memory production fallback.

## Run Locally

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Environment

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=replace-this-secret
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Cloudinary is used for optional food-safety report evidence uploads. Create a Cloudinary account, copy the cloud name, API key, and API secret into `backend/.env`, then restart the backend. Uploaded evidence is streamed from the backend to Cloudinary; Annapurna stores only the returned secure Cloudinary URLs in MongoDB and never stores uploaded image files in the repository.

Optional mailer foundation:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
SMTP_FROM=
```

## Admin Promotion

Public registration cannot create admins. Promote an existing user:

```bash
npm run promote-admin -- user@example.com
```

## Future Scope

- Official regulatory data integration, only with authorized sources
- Proximity-based safety alerts
- Receipt or QR-based visit verification
- OCR menu scanning
- AI-assisted risk detection
