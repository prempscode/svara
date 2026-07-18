import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../components/PageLayout/PageLayout";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";

import { getProfile, updateProfile } from "../services/profileService";
import { useAuth } from "../context/AuthContext";

import styles from "./EditProfile.module.css";

function EditProfile() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();

        setUsername(data.user.username);
        setCurrentImage(data.user.profileImage || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("username", username);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await updateProfile(formData);

      await refreshProfile();

      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageLayout title="Edit Profile">
        <h2>Loading...</h2>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit Profile"
      subtitle="Update your profile information."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.imageSection}>
          <img
            src={
              preview ||
              currentImage ||
              "https://placehold.co/200x200?text=User"
            }
            alt="Profile"
            className={styles.avatar}
            loading="lazy"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
        </div>

        <Input
          label="Username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </Button>

          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default EditProfile;
