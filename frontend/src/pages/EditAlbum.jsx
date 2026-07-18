import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAlbumById,
  getAllMusic,
  updateAlbum,
} from "../services/musicService";

import PageLayout from "../components/PageLayout/PageLayout";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";

import styles from "./CreateAlbum.module.css";

function EditAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [musics, setMusics] = useState([]);
  const [selectedMusics, setSelectedMusics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [albumData, musicData] = await Promise.all([
          getAlbumById(id),
          getAllMusic(),
        ]);

        const album = albumData.album;

        setTitle(album.title);
        setDescription(album.description || "");
        setSelectedMusics(album.musics.map((music) => music._id));

        setMusics(musicData.musics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function toggleMusic(id) {
    setSelectedMusics((prev) =>
      prev.includes(id)
        ? prev.filter((musicId) => musicId !== id)
        : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setUpdating(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("musics", JSON.stringify(selectedMusics));

    if (image) {
      formData.append("image", image);
    }

    try {
      await updateAlbum(id, formData);
      navigate(`/albums/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to update album");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <PageLayout title="Edit Album">
        <h2>Loading...</h2>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Album" subtitle="Update your album details.">
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Album Title"
          placeholder="Summer Vibes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className={styles.field}>
          <label className={styles.label}>Description</label>

          <textarea
            className={styles.textarea}
            rows={5}
            placeholder="Write something about this album..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Change Album Cover (Optional)</label>

          <input
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div className={styles.field}>
          <h3 className={styles.songTitle}>Songs</h3>

          <div className={styles.songList}>
            {musics.map((music) => (
              <label key={music._id} className={styles.songItem}>
                <input
                  type="checkbox"
                  checked={selectedMusics.includes(music._id)}
                  onChange={() => toggleMusic(music._id)}
                />

                <span>{music.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/albums/${id}`)}
          >
            Cancel
          </Button>

          <Button type="submit" loading={updating}>
            Update Album
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default EditAlbum;
