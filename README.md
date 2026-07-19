# 🎵 Svara

**Svara** is a full-stack music playlist / streaming app. Users can register , upload and browse music tracks, like songs, organize tracks into albums, and manage their profile — all served through a React frontend backed by a Node.js/Express/MongoDB API.

This is a monorepo with two independent apps:

```
svara/
├── backend/    # Node.js + Express + MongoDB REST API
└── frontend/   # React + Vite client
```

- 📄 [Backend README](./backend/README.md) — API architecture, endpoints, and setup
- 📄 [Frontend README](./frontend/README.md) — App structure, routes, and setup

---

## ✨ Features

- 🔐 Registration, login/logout via JWT (HTTP-only cookies)
- 🎧 Upload, browse, edit, and delete music tracks (audio + cover art, stored on ImageKit)
- ❤️ Like/unlike tracks and view a personal liked-tracks feed
- 💿 Create, browse, edit, and delete albums with linked tracks
- 🙍 View and edit your profile, and view other users' public profiles

---

## 🛠️ Tech Stack

| | |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Axios, CSS Modules |
| **Backend** | Node.js, Express 5, MongoDB + Mongoose, JWT, Multer, ImageKit |

---

## 🚀 Quick Start

Run the backend and frontend in two separate terminals.

### 1. Backend

```bash
cd backend
npm install
# create a .env file — see backend/README.md for required variables
npm run dev
```

Runs on **http://localhost:5000**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** and talks to the backend at `http://localhost:5000/api`.

See each app's README for full setup details, environment variables, project structure, and API/route references.

---

## 📄 License

ISC
