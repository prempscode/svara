import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllAlbums } from "../services/musicService";

import PageLayout from "../components/PageLayout/PageLayout";

import styles from "./Albums.module.css";

function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const data = await getAllAlbums();
        setAlbums(data.albums);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Albums">
        <p>Loading albums...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Albums"
      subtitle="Discover music collections shared by the community."
    >
      {albums.length === 0 ? (
        <p className={styles.empty}>No albums available.</p>
      ) : (
        <div className={styles.grid}>
          {albums.map((album) => (
            <Link
              key={album._id}
              to={`/albums/${album._id}`}
              className={styles.card}
            >
              {album.image ? (
                <img
                  src={album.image}
                  alt={album.title}
                  loading="lazy"
                  className={styles.image}
                />
              ) : (
                <div className={styles.placeholder}>🎵</div>
              )}

              <div className={styles.content}>
                <h3>{album.title}</h3>
                <p>{album.artist.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export default Albums;
