import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../components/PageLayout/PageLayout";
import Button from "../components/Button/Button";
import MusicCard from "../components/MusicCard/MusicCard";

import { getProfile } from "../services/profileService";
import {
  getUserTracks,
  getUserAlbums,
  getLikedTracks,
} from "../services/musicService";

import styles from "./Profile.module.css";

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [liked, setLiked] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileData = await getProfile();

        setProfile(profileData.user);

        const [trackData, albumData, likedData] = await Promise.all([
          getUserTracks(profileData.user._id),
          getUserAlbums(profileData.user._id),
          getLikedTracks(),
        ]);

        setTracks(trackData.musics);
        setAlbums(albumData.albums);
        setLiked(likedData.musics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Profile">
        <h2>Loading...</h2>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile">
      <div className={styles.header}>
        <img
          src={profile.profileImage || "https://placehold.co/200x200?text=User"}
          alt={profile.username}
          className={styles.avatar}
          loading="lazy"
        />

        <h2>{profile.username}</h2>

        <Button variant="secondary" onClick={() => navigate("/profile/edit")}>
          Edit Profile
        </Button>
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

        <div className={styles.stat}>
          <h3>{liked.length}</h3>
          <p>Likes</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recently Uploaded</h2>

          {tracks.length > 4 && (
            <Button variant="secondary" onClick={() => navigate("/my-tracks")}>
              View All
            </Button>
          )}
        </div>

        {tracks.length === 0 ? (
          <p className={styles.empty}>You haven't uploaded any music yet.</p>
        ) : (
          <div className={styles.grid}>
            {tracks.slice(0, 4).map((music) => (
              <MusicCard
                key={music._id}
                music={music}
                isLiked={music.likes.some(
                  (id) => id?.toString() === profile._id,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
