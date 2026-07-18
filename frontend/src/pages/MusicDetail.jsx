import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMusicById,
  toggleLike,
  deleteMusic,
} from "../services/musicService";

import { useAuth } from "../context/AuthContext";

import Button from "../components/Button/Button";
import PageLayout from "../components/PageLayout/PageLayout";

import styles from "./MusicDetail.module.css";

function MusicDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [music, setMusic] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [deleting, setDeleting] = useState(false);

  async function fetchMusic() {
    try {
      setLoading(true);
      setError(null);

      const data = await getMusicById(id);

      setMusic(data.music);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch music.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetch = () => fetchMusic();
    fetch();
  }, [id]);

  async function handleLike() {
    try {
      const data = await toggleLike(id);

      setMusic((prev) => {
        const updatedLikes = data.isLiked
          ? [...prev.likes, user._id]
          : prev.likes.filter((likeId) => likeId?.toString() !== user._id);

        return {
          ...prev,
          likes: updatedLikes,
        };
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    const confirmDelete = window.confirm("Delete this music?");

    if (!confirmDelete) return;

    setDeleting(true);

    try {
      await deleteMusic(id);
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <PageLayout title="Music">
        <h2>Loading...</h2>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Music">
        <h2>{error}</h2>
      </PageLayout>
    );
  }

  const isLiked = music.likes.some((likeId) => likeId?.toString() === user._id);

  const isOwner = music.artist._id === user._id;

  return (
    <PageLayout title={music.title} subtitle={`By ${music.artist.username}`}>
      {music.image && (
        <img
          src={music.image}
          alt={music.title}
          className={styles.cover}
          loading="lazy"
        />
      )}

      <div className={styles.info}>
        <p className={styles.description}>
          {music.description || "No description available."}
        </p>

        <div className={styles.meta}>
          <span>
            <strong>Artist:</strong> {music.artist.username}
          </span>

          <span>
            <strong>Likes:</strong> {music.likes.length}
          </span>
        </div>

        <audio controls src={music.uri} className={styles.audio} />

        <a
          href={music.uri}
          target="_blank"
          rel="noreferrer"
          className={styles.link}
        >
          Open Audio
        </a>

        <div className={styles.actions}>
          <Button onClick={handleLike}>{isLiked ? "Unlike" : "Like"}</Button>

          <Button variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>

          {isOwner && (
            <>
              <Button
                variant="secondary"
                onClick={() => navigate(`/music/${id}/edit`)}
              >
                Edit
              </Button>

              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default MusicDetail;
