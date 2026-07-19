import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar/Navbar";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import UploadMusic from "./pages/UploadMusic";
import MusicDetail from "./pages/MusicDetail";
import EditMusic from "./pages/EditMusic";

import Liked from "./pages/Liked";

import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import CreateAlbum from "./pages/CreateAlbum";
import EditAlbum from "./pages/EditAlbum";

import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/UserProfile";

import PublicRoute from "./components/PublicRoute";

const ProtectedLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* protected routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <UploadMusic />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/music/:id"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <MusicDetail />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/music/:id/edit"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <EditMusic />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/liked"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Liked />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/albums"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Albums />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/albums/:id"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <AlbumDetail />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/albums/:id/edit"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <EditAlbum />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-album"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <CreateAlbum />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <EditProfile />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <UserProfile />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
