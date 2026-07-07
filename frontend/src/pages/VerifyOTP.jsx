import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("tempUserId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", { userId, otp });
      localStorage.removeItem("tempUserId");
      localStorage.setItem("token", response.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", {
        email: localStorage.getItem("tempEmail"),
      });
      alert("New OTP sent to your email!");
    } catch (error) {
      console.log(error.message);
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">📧 Verify Email</h1>
          <p className="text-gray-400 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg mb-6 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-green-500"
            maxLength="6"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          Didn't receive code?{" "}
          <button
            onClick={handleResend}
            className="text-green-500 hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}
