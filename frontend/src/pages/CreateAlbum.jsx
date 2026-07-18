import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { createAlbum, getUserTracks } from "../services/musicService";

import Input from "../components/Input/Input";
import Button from "../components/Button/Button";
import PageLayout from "../components/PageLayout/PageLayout";
import { useAuth } from "../context/AuthContext";

import styles from "./CreateAlbum.module.css";

function CreateAlbum() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [musics, setMusics] = useState([]);
  const [selectedMusics, setSelectedMusics] = useState([]);

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadMusic() {
      try {
        const data = await getUserTracks(user._id);
        setMusics(data.musics);
      } catch (err) {
        console.error(err);
      }
    }

    loadMusic();
  }, [user]);

  function toggleMusic(id) {
    setSelectedMusics((prev) =>
      prev.includes(id)
        ? prev.filter((musicId) => musicId !== id)
        : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Album title is required");
      return;
    }

    if (selectedMusics.length === 0) {
      alert("Select at least one song");
      return;
    }

    setCreating(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("musics", JSON.stringify(selectedMusics));

    if (image) {
      formData.append("image", image);
    }

    try {
      await createAlbum(formData);
      navigate("/albums");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to create album");
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageLayout
      title="Create Album"
      subtitle="Create a collection of your own songs."
    >
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
          <label className={styles.label}>Album Cover</label>

          <input
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div className={styles.field}>
          <h3 className={styles.songTitle}>Select Songs</h3>

          {musics.length === 0 ? (
            <Link to={"/upload"}>
              <Button className={styles.empty} variant="secondary">
                Upload music to begin.
              </Button>
            </Link>
          ) : (
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
          )}
        </div>

        <Button type="submit" loading={creating} disabled={musics.length === 0}>
          Create Album
        </Button>
      </form>
    </PageLayout>
  );
}

export default CreateAlbum;
