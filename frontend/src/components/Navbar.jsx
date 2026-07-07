import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { to: "/home", label: "Home", icon: "🏠" },
    { to: "/liked", label: "Liked", icon: "❤️" },
    { to: "/albums", label: "Albums", icon: "📀" },
    { to: "/upload", label: "Upload", icon: "📤" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-gray-800 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/home"
          className="text-2xl font-bold text-white flex items-center gap-2 hover:text-green-500 transition"
        >
          🎵 Svara
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-300 hover:text-white transition text-sm"
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-2xl"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-800 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="block text-gray-300 hover:text-white transition text-sm py-2 px-3 hover:bg-gray-800 rounded"
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full text-left text-red-400 hover:text-red-300 transition text-sm py-2 px-3 hover:bg-gray-800 rounded"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}
