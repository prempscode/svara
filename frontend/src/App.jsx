import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Liked from "./pages/Liked";
import Upload from "./pages/Upload";
import EditTrack from "./pages/EditTrack";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
