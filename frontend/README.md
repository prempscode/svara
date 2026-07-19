# 🎧 Svara Frontend

The client application for **Svara**, a music playlist / streaming app. Built with **React 19** and **Vite**, it lets users register, upload and browse music, manage albums, like tracks, and manage their profile.

---

## 🚀 Features

- 🔐 **Auth Flow** — Register , login, and protected routing via `AuthContext`
- 🏠 **Home Feed** — Browse all uploaded tracks
- 🎵 **Music Management** — Upload, view, and edit tracks
- ❤️ **Liked Tracks** — A dedicated feed of tracks you've liked
- 💿 **Albums** — Browse, create, view, and edit albums with linked tracks
- 🙍 **Profiles** — View and edit your own profile, view other users' public profiles
- 🛡️ **Protected Routes** — `ProtectedRoute` guards authenticated pages and redirects unauthenticated users
- 💅 **CSS Modules** — Scoped, per-page styling alongside shared global styles and CSS variables

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Library | React 19 |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Icons | react-icons |
| Styling | CSS Modules + global CSS variables |
| Linting | ESLint (React Hooks + Refresh plugins) |

---

## 📁 Project Structure

```
frontend/
├── index.html                   # Vite HTML entry point
├── vite.config.js               # Vite config
├── eslint.config.js             # ESLint config
├── public/                      # Static assets
└── src/
    ├── main.jsx                 # React root, router & context providers
    ├── App.jsx                  # Route definitions (public + protected)
    ├── api/
    │   └── axios.js             # Preconfigured Axios instance (baseURL, credentials)
    ├── context/
    │   └── AuthContext.jsx      # Auth state (current user, login/logout)
    ├── services/
    │   ├── authService.js       # Register/login/profile API calls
    │   ├── musicService.js      # Track upload/fetch/like API calls
    │   └── profileService.js    # Profile fetch/update API calls
    ├── components/
    │   ├── Navbar/               # App navigation bar
    │   ├── PageLayout/           # Shared page wrapper
    │   ├── Button/, Input/       # Reusable form controls
    │   ├── MusicCard.jsx         # Track preview card
    │   ├── AlbumCard.jsx         # Album preview card
    │   ├── Loader.jsx            # Loading indicator
    │   └── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
    ├── pages/
    │   ├── LandingPage.jsx       # Public landing page
    │   ├── Login.jsx / Register.jsx
    │   ├── Home.jsx              # Main authenticated feed
    │   ├── UploadMusic.jsx / EditMusic.jsx / MusicDetail.jsx
    │   ├── Liked.jsx             # Liked tracks feed
    │   ├── Albums.jsx / AlbumDetail.jsx / CreateAlbum.jsx / EditAlbum.jsx
    │   └── Profile.jsx / EditProfile.jsx / UserProfile.jsx
    └── styles/
        ├── globals.css
        └── variables.css
```

---

## 🗺️ Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/home` | Main music feed | Protected |
| `/upload` | Upload a track | Protected |
| `/music/:id` | Track detail | Protected |
| `/music/:id/edit` | Edit a track | Protected |
| `/liked` | Liked tracks feed | Protected |
| `/albums` | All albums | Protected |
| `/albums/:id` | Album detail | Protected |
| `/albums/:id/edit` | Edit an album | Protected |
| `/create-album` | Create an album | Protected |
| `/profile` | Own profile | Protected |
| `/profile/edit` | Edit own profile | Protected |
| `/users/:id` | Another user's public profile | Protected |

Protected routes are wrapped in `ProtectedRoute` (redirects to `/login` if not authenticated) and rendered with a shared `Navbar` layout.

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/prempscode/svara.git
cd svara/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API base URL

The Axios instance in `src/api/axios.js` points to the backend:

```js
baseURL: "http://localhost:5000/api"
withCredentials: true
```

Make sure the [backend](../backend/README.md) is running on `http://localhost:5000` before starting the frontend, since auth relies on an HTTP-only cookie shared via `withCredentials`. Update this URL if your backend runs elsewhere.

### 4. Run the dev server

```bash
npm run dev
```

The app runs on **http://localhost:5173** by default.

### Other scripts

```bash
npm run build     # Production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

---

## 🧠 Key Concepts Implemented

- **Auth Context** — `AuthContext` centralizes the current user and auth status so any component can check login state without prop drilling
- **Protected Routing** — `ProtectedRoute` wraps authenticated pages and redirects to `/login` when there's no valid session
- **Service Layer** — API calls are grouped into `authService`, `musicService`, and `profileService` rather than scattered across components, keeping pages focused on UI
- **Cookie-based Sessions** — Axios is configured with `withCredentials: true` so the backend's HTTP-only JWT cookie is sent automatically on every request
- **CSS Modules** — Each page/component that needs custom styling has a co-located `*.module.css` file to avoid class name collisions, with shared tokens in `styles/variables.css`

---


