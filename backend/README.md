# 🎵 Svara Backend

The REST API powering **Svara**, a music playlist / streaming platform. Built with **Node.js**, **Express 5**, and **MongoDB (Mongoose)**, it handles authentication (with email OTP verification), user profiles, music track uploads, likes, and album management, with all media files stored on **ImageKit**.

---

## 🚀 Features

- 🔐 **JWT Authentication** — Tokens issued on login/registration and stored in HTTP-only cookies
- ✉️ **Email OTP Verification** — New accounts are verified via a one-time code sent by email (Nodemailer), with resend support
- 👥 **User Roles** — Accounts can be `user` or `artist` (role is stored on the user, available for role-gated routes)
- 🎧 **Music Upload & Management** — Upload, update, and delete tracks (audio + cover image) via Multer + ImageKit
- ❤️ **Likes** — Toggle like/unlike on tracks and fetch a personalized "liked" feed
- 💿 **Album Management** — Create, update, delete albums and link multiple tracks to them
- 🙍 **Profile Management** — View your own profile, view other users' public profiles, update profile info/avatar, delete account
- 🛡️ **Protected Routes** — Custom middleware guards every sensitive endpoint using the JWT cookie
- 🏗️ **MVC-style Architecture** — Clean separation of models, controllers, routes, middleware, and services

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt / bcryptjs |
| Email | Nodemailer (OTP delivery) |
| File Storage | Multer (in-memory) + ImageKit |
| Image Processing | sharp |
| Config Management | dotenv |
| Cross-Origin | cors + cookie-parser |

---

## 📁 Project Structure

```
backend/
├── server.js                    # Entry point — loads env, starts server & DB connection
├── src/
│   ├── app.js                   # Express app setup (cors, cookies, routes)
│   ├── db/
│   │   └── db.js                # MongoDB connection (Mongoose)
│   ├── model/
│   │   ├── user.model.js        # User schema (role, OTP fields, profile image)
│   │   ├── music.model.js       # Music track schema (likes, artist ref)
│   │   └── album.model.js       # Album schema (linked tracks)
│   ├── routes/
│   │   ├── auth.routes.js       # /api/auth  — auth + profile routes
│   │   └── music.routes.js      # /api/music — track + album routes
│   ├── controllers/
│   │   ├── auth.controller.js   # Register/login/OTP/profile logic
│   │   └── music.controller.js  # Track/album CRUD + likes logic
│   ├── middlewares/
│   │   └── auth.middleware.js   # authGlobal & authArtist guards
│   └── services/
│       ├── storage.service.js   # ImageKit upload/delete logic
│       └── email.service.js     # Nodemailer OTP email logic
├── package.json
└── .env                         # Not committed — see below
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`. Routes marked **Auth** require a valid `token` cookie (checked by the `authGlobal` middleware).

### Auth & Profile — `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new account (triggers OTP email) | Public |
| POST | `/verify-otp` | Verify the OTP sent to email and activate the account | Public |
| POST | `/resend-otp` | Resend a fresh OTP code | Public |
| POST | `/login` | Login and receive a JWT cookie | Public |
| POST | `/logout` | Clear the auth cookie | Public |
| GET | `/profile` | Get the logged-in user's own profile | Auth |
| GET | `/profile/:userId` | Get another user's public profile | Auth |
| PATCH | `/profile` | Update own profile (optional image upload) | Auth |
| DELETE | `/profile` | Delete own account | Auth |

### Music & Albums — `/api/music`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/upload` | Upload a new track (audio + optional cover image) | Auth |
| GET | `/` | Get all tracks (public feed) | Auth |
| GET | `/track/:id` | Get a single track by ID | Auth |
| PATCH | `/:id` | Update a track (optional new audio/image) | Auth |
| DELETE | `/:id` | Delete a track | Auth |
| GET | `/user/:userId` | Get all tracks uploaded by a specific user | Auth |
| POST | `/:id/like` | Like / unlike a track (toggle) | Auth |
| GET | `/liked` | Get the current user's liked tracks feed | Auth |
| POST | `/album` | Create a new album (optional cover image) | Auth |
| GET | `/albums` | Get all albums | Auth |
| GET | `/albums/:id` | Get a single album with its tracks | Auth |
| PATCH | `/albums/:id` | Update an album (optional new image) | Auth |
| DELETE | `/albums/:id` | Delete an album | Auth |
| GET | `/albums/user/:userId` | Get all albums created by a specific user | Auth |

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/prempscode/svara.git
cd svara/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file inside `backend/`:

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# ImageKit (audio + image storage)
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

# Email (for OTP delivery via Nodemailer)
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_app_password
```

### 4. Run the server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The server listens on **http://localhost:5000** (see `server.js`); all routes are mounted under `/api`. The frontend (running on `http://localhost:5173`) is already whitelisted via CORS.

---

## 🧠 Key Concepts Implemented

- **Password Hashing** — User passwords are hashed with bcrypt before being stored
- **Email OTP Flow** — Registration is a two-step process: `register` creates an unverified account and emails an OTP, `verify-otp` activates it (with `resend-otp` for expired/lost codes)
- **JWT in HTTP-only Cookies** — The token is never exposed to client-side JS, reducing XSS risk
- **Middleware Guards** — `authGlobal` validates the JWT on every protected route; `authArtist` is available for routes that should be artist-only
- **In-memory Multer + ImageKit** — Uploaded files are buffered in memory and streamed straight to ImageKit (no local disk writes), organized into `svara/audio` and `svara/image` folders
- **Mongoose References** — Tracks and albums reference their owning `user` via ObjectId, and albums reference their `music` tracks
- **Likes as Toggle** — A single endpoint (`POST /:id/like`) adds or removes the current user from a track's `likes` array and keeps `likesCount` in sync

---

## 🙏 Acknowledgements

Special thanks to **Ankur Prajapati** for teaching complex backend concepts in a simple and structured way. This project wouldn't have been possible without that guidance!

---

## 📄 License

ISC
