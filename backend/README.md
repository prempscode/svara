# 🎵 svara Backend

A full-featured REST API backend inspired by svara, built with **Node.js**, **Express**, and **MongoDB**. This project focuses on **Role-Based Authentication & Authorization**, allowing Artists and Users to have different levels of access.

---

## 🚀 Features

- 🔐 **JWT Authentication** — Secure login with tokens stored in HTTP-only cookies
- 👥 **Role-Based Authorization** — Separate access for `artist` and `user` roles
- 🎧 **Music Upload** — Artists can upload tracks via Multer + ImageKit cloud storage
- 💿 **Album Management** — Artists can create albums and link multiple tracks
- 📄 **Pagination Support** — Efficient music listing using `.skip()` and `.limit()`
- 🛡️ **Protected Routes** — Custom middleware guards all sensitive endpoints
- 🏗️ **MVC Architecture** — Clean separation of models, controllers, routes, and services

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| File Uploads | Multer + ImageKit |
| Config Management | dotenv |

---

## 📁 Project Structure

```
spotify-backend/
├── server.js                  # Entry point
├── src/
│   ├── app.js                 # Express app setup
│   ├── db/
│   │   └── db.js              # MongoDB connection
│   ├── model/
│   │   ├── user.model.js      # User schema (role: user | artist)
│   │   ├── music.model.js     # Music schema
│   │   └── album.model.js     # Album schema
│   ├── routes/
│   │   ├── auth.routes.js     # /api/auth
│   │   └── music.routes.js    # /api/music
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── music.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js # authArtist & authGlobal guards
│   └── services/
│       └── storage.service.js # ImageKit upload logic
├── package.json
└── .env
```

---

## 🔑 Role-Based Access Control

| Role | Can Do |
|---|---|
| `user` | Register, Login, Browse music, View albums |
| `artist` | Everything above + Upload music, Create albums |

Roles are embedded in the JWT payload and verified by middleware on every protected request.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new user or artist | Public |
| POST | `/login` | Login and receive JWT cookie | Public |
| POST | `/logout` | Clear the auth cookie | Public |

### Music — `/api/music`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/upload` | Upload a music track (multipart) | Artist only |
| POST | `/album` | Create a new album | Artist only |
| GET | `/` | Get all music (paginated) | Authenticated |
| GET | `/albums` | Get all albums | Authenticated |
| GET | `/albums/:id` | Get a single album by ID | Authenticated |

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/prempscode/spotify-backend.git
cd spotify-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 4. Run the server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:3000**

---

## 🧠 Key Concepts Implemented

- **Password Hashing** — User passwords are hashed with `bcrypt` before storing in DB
- **JWT in Cookies** — Token is stored in an HTTP-only cookie (not localStorage) for security
- **Middleware Guards** — `authArtist` and `authGlobal` middleware intercept requests before they reach controllers
- **Mongoose Populate** — Artist details are populated on music/album responses without exposing sensitive fields
- **Pagination** — `.skip()` and `.limit()` are used to prevent heavy DB loads on music listing

---

## 🙏 Acknowledgements

Special thanks to **Ankur Prajapati** for teaching complex backend concepts in a simple and structured way. This project wouldn't have been possible without that guidance!

---

## 📄 License

ISC
