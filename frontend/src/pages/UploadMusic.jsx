import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { uploadMusic } from "../services/musicService";

import PageLayout from "../components/PageLayout/PageLayout";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";

import styles from "./UploadMusic.module.css";

function UploadMusic() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audio, setAudio] = useState(null);
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      return setError("Title is required");
    }

    if (!audio) {
      return setError("Please select an audio file");
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("audio", audio);

      if (image) {
        formData.append("image", image);
      }

      await uploadMusic(formData);

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout title="Upload Music" subtitle="Share your music with everyone.">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}

        <Input
          label="Title"
          placeholder="Song title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Description</label>

          <textarea
            className={styles.textarea}
            rows={5}
            placeholder="Write something about your music..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Audio File</label>

          <input
            className={styles.fileInput}
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cover Image (Optional)</label>

          <input
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button type="submit" loading={loading}>
            Upload Music
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default UploadMusic;
