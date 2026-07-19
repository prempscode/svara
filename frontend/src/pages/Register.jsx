import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import PageLayout from "../components/PageLayout/PageLayout";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";

import styles from "./Auth.module.css";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
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

    if (!formData.username.trim()) {
      alert("Username is required");
      return;
    }
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
      await register(formData);
      navigate("/home", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout
      title="Create Account"
      subtitle="Join and start sharing your music."
    >
      <div className={styles.wrapper}>
        <Link to="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />
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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit" loading={isSubmitting} fullWidth>
            Create Account
          </Button>
          <p className={styles.footer}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </PageLayout>
  );
};

export default Register;
