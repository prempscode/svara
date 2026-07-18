import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getAlbumById, deleteAlbum } from "../services/musicService";

import PageLayout from "../components/PageLayout/PageLayout";
import Button from "../components/Button/Button";

import styles from "./AlbumDetail.module.css";

function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadAlbum() {
      try {
        const data = await getAlbumById(id);
        setAlbum(data.album);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAlbum();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this album?")) return;

    try {
      setDeleting(true);

      await deleteAlbum(id);

      navigate("/albums");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to delete album");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <PageLayout title="Album">
        <p>Loading...</p>
      </PageLayout>
    );
  }

  if (!album) {
    return (
      <PageLayout title="Album">
        <p>Album not found.</p>
      </PageLayout>
    );
  }

  const isOwner = album.artist._id === user._id;

  return (
    <PageLayout
      title={album.title}
      subtitle={album.description || "Album details"}
    >
      {album.image && (
        <img
          src={album.image}
          alt={album.title}
          className={styles.cover}
          loading="lazy"
        />
      )}

      <section className={styles.section}>
        <h2>Tracks</h2>

        {album.musics.length === 0 ? (
          <p className={styles.empty}>No songs in this album.</p>
        ) : (
          <div className={styles.trackList}>
            {album.musics.map((music) => (
              <div key={music._id} className={styles.trackCard}>
                <Link to={`/music/${music._id}`} className={styles.trackLink}>
                  {music.image ? (
                    <img
                      src={music.image}
                      alt={music.title}
                      className={styles.trackImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.trackPlaceholder}>🎵</div>
                  )}

                  <div className={styles.trackInfo}>
                    <h3>{music.title}</h3>
                    <p>{music.artist.username}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {isOwner && (
        <div className={styles.actions}>
          <Button onClick={() => navigate(`/albums/${id}/edit`)}>
            Edit Album
          </Button>

          <Button variant="secondary" onClick={handleDelete} loading={deleting}>
            Delete Album
          </Button>
        </div>
      )}
    </PageLayout>
  );
}

export default AlbumDetail;
