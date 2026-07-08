import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Music2 } from "lucide-react";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/home");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Music2 className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Svara
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Music sharing, reimagined
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-white/5 text-white placeholder:text-white/30 pl-12 pr-5 py-4 rounded-xl outline-none focus:ring-1 focus:ring-red-500/50 transition"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-white/5 text-white placeholder:text-white/30 pl-12 pr-5 py-4 rounded-xl outline-none focus:ring-1 focus:ring-red-500/50 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-white/40 text-center mt-6 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-white hover:underline transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
