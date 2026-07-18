import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMusicById, updateMusic } from "../services/musicService";

import PageLayout from "../components/PageLayout/PageLayout";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";

import styles from "./CreateAlbum.module.css";

function EditMusic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [audio, setAudio] = useState(null);
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadMusic() {
      try {
        const data = await getMusicById(id);

        setTitle(data.music.title);
        setDescription(data.music.description || "");
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load music.");
      } finally {
        setLoading(false);
      }
    }

    loadMusic();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    setUploading(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);

    if (audio) {
      formData.append("audio", audio);
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      await updateMusic(id, formData);
      navigate(`/music/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to update music");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <PageLayout title="Edit Music">
        <h2>Loading...</h2>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Music" subtitle="Update your music details.">
      {error && (
        <p
          style={{
            color: "#ff453a",
            marginBottom: "20px",
          }}
        >
          {error}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Title"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Description</label>

          <textarea
            className={styles.textarea}
            rows={5}
            placeholder="Write something about this music..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Replace Audio (Optional)</label>

          <input
            className={styles.fileInput}
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Replace Cover Image (Optional)</label>

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
            onClick={() => navigate(`/music/${id}`)}
          >
            Cancel
          </Button>

          <Button type="submit" loading={uploading}>
            Update Music
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default EditMusic;
