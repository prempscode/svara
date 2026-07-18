import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageLayout from "../components/PageLayout/PageLayout";
import MusicCard from "../components/MusicCard/MusicCard";

import { getUserProfile } from "../services/profileService";
import { getUserTracks, getUserAlbums } from "../services/musicService";

import styles from "./UserProfile.module.css";

function UserProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, trackData, albumData] = await Promise.all([
          getUserProfile(id),
          getUserTracks(id),
          getUserAlbums(id),
        ]);

        setProfile(profileData.user);
        setTracks(trackData.musics);
        setAlbums(albumData.albums);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <PageLayout title="Profile">
        <h2>Loading...</h2>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout title="Profile">
        <h2>User not found.</h2>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={profile.username}>
      <div className={styles.header}>
        <img
          src={profile.profileImage || "https://placehold.co/200x200?text=User"}
          alt={profile.username}
          className={styles.avatar}
          loading="lazy"
        />

        <h2>{profile.username}</h2>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <h3>{tracks.length}</h3>
          <p>Songs</p>
        </div>

        <div className={styles.stat}>
          <h3>{albums.length}</h3>
          <p>Albums</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Uploaded Songs</h2>

        {tracks.length === 0 ? (
          <p className={styles.empty}>No songs uploaded yet.</p>
        ) : (
          <div className={styles.grid}>
            {tracks.map((music) => (
              <MusicCard
                key={music._id}
                music={music}
                showLike={false}
                showLikeCount={false}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Albums</h2>

        {albums.length === 0 ? (
          <p className={styles.empty}>No albums created yet.</p>
        ) : (
          <div className={styles.albumGrid}>
            {albums.map((album) => (
              <Link
                key={album._id}
                to={`/albums/${album._id}`}
                className={styles.albumCard}
              >
                {album.image ? (
                  <img
                    src={album.image}
                    alt={album.title}
                    className={styles.albumImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.placeholder}>🎵</div>
                )}

                <div className={styles.albumContent}>
                  <h3>{album.title}</h3>
                  <p>{album.artist.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default UserProfile;
