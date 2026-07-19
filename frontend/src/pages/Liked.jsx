import { useEffect, useState } from "react";

import PageLayout from "../components/PageLayout/PageLayout";
import MusicCard from "../components/MusicCard/MusicCard";

import { getLikedTracks } from "../services/musicService";

import styles from "./Liked.module.css";

function Liked() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLikedSongs() {
      try {
        const data = await getLikedTracks();
        setTracks(data.musics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLikedSongs();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Liked Songs">
        <p>Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Liked Songs" subtitle="Songs you've liked.">
      {tracks.length === 0 ? (
        <div className={styles.empty}>
          <h3>No liked songs yet</h3>
          <p>Start liking songs to see them here.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {tracks.map((music) => (
            <MusicCard key={music._id} music={music} showLike={false} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export default Liked;
