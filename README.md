# 🍽️ Annapurna – Food Safety Intelligence Platform

> **Eat with confidence, not assumptions.**

Annapurna is a full-stack web application that empowers users to make informed dining decisions by providing restaurant transparency, ingredient awareness, verified reviews, and food safety reporting.

The platform is designed to bridge the gap between consumers and food safety by making critical restaurant information accessible in one place.

---

## ✨ Features

* 🔍 Search and browse restaurants
* 🍽️ View detailed restaurant profiles
* 🥗 Ingredient transparency for dishes
* ⚠️ Allergy-aware ingredient warnings
* ⭐ Verified review system
* 📊 Restaurant Safety Score
* 🚨 Food safety incident reporting
* 👤 Secure user authentication with JWT
* 🧑 User profile with dietary preferences

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* In-memory seeded data (for local demo)

### Authentication

* JSON Web Tokens (JWT)

---

## 📁 Project Structure

```text
frontend/
backend/
README.md
package.json
```

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run the project

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## ⚙️ Environment Variables

Create `backend/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_ORIGIN=http://localhost:5173
```

If `MONGO_URI` is not provided, the application automatically uses seeded in-memory demo data.

---

## 📸 Screenshots

> Screenshots will be added after deployment.

---

## 🎨 UI Design

The user interface was initially designed in Figma before implementation.

---

## 🚀 Future Enhancements

* Google Maps integration
* Nearby restaurant discovery
* AI-powered ingredient risk detection
* OCR-based menu scanning
* Government food safety data integration
* Notification system
* Restaurant owner dashboard

---

## 👩‍💻 Developed By

**Nithya Goud**
