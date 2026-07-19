import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { resendOTP, verifyOTP } from "../services/authService";

import PageLayout from "../components/PageLayout/PageLayout";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";

import styles from "./Auth.module.css";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const { refreshProfile } = useAuth();

  const [otp, setOtp] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const pendingVerification = useMemo(() => {
    const data = localStorage.getItem("pendingVerification");
    return data ? JSON.parse(data) : null;
  }, []);

  const userId = pendingVerification?.userId;
  const email = pendingVerification?.email;

  function maskEmail(email) {
    if (!email) return "";

    const [username, domain] = email.split("@");

    const visible = username.slice(0, 3);

    return `${visible}****@${domain}`;
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();

    if (!otp.trim()) {
      alert("OTP is required");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyOTP(userId, otp);

      localStorage.removeItem("pendingVerification");

      await refreshProfile();

      navigate("/home", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendOTP() {
    setIsResending(true);

    try {
      await resendOTP(email);

      alert("OTP sent successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to resend OTP");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <PageLayout
      title="Verify Email"
      subtitle="Enter the verification code sent to your email."
    >
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleVerifyOTP}>
          <p className={styles.info}>{maskEmail(email)}</p>

          <Input
            label="OTP"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button type="submit" loading={isVerifying} fullWidth>
            Verify OTP
          </Button>

          <Button
            type="button"
            variant="secondary"
            loading={isResending}
            onClick={handleResendOTP}
            fullWidth
          >
            Resend OTP
          </Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default VerifyOTP;
