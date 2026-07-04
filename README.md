# Annapurna

Food Safety Intelligence Platform.

Tagline: **Eat with confidence, not assumptions.**

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB with an in-memory local fallback
- Auth: JWT

## Run Locally

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Environment

Create `backend/.env` for production-like runs:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=replace-this-secret
CLIENT_ORIGIN=http://localhost:5173
```

If `MONGO_URI` is omitted, the API uses seeded in-memory data so the MVP works immediately.
