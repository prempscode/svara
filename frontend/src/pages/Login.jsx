import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import PageLayout from "../components/PageLayout/PageLayout";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";

import styles from "./Auth.module.css";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!formData.password.trim()) {
      alert("Password is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);

      navigate("/home", { replace: true });
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout
      title="Welcome Back"
      subtitle="Sign in to continue listening to your music."
    >
      <div className={styles.wrapper}>
        <Link to="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button type="submit" loading={isSubmitting} fullWidth>
            Login
          </Button>

          <p className={styles.footer}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </PageLayout>
  );
}
