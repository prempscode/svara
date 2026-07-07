import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Liked from './pages/Liked';
import Upload from './pages/Upload';
import EditTrack from './pages/EditTrack';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import CreateAlbum from './pages/CreateAlbum';
import EditAlbum from './pages/EditAlbum';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/liked" element={<Liked />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/edit-track/:id" element={<EditTrack />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/create-album" element={<CreateAlbum />} />
        <Route path="/edit-album/:id" element={<EditAlbum />} />
        <Route path="/user/:userId" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;