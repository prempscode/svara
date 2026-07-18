import { useEffect, useState } from "react";
import { getAllMusic } from "../services/musicService";
import { Link } from "react-router-dom";
import { toggleLike } from "../services/musicService";
import { useAuth } from "../context/AuthContext";
import MusicCard from "../components/MusicCard/MusicCard";
import styles from "./Home.module.css";
import PageLayout from "../components/PageLayout/PageLayout";

const Home = () => {
  const [musics, setMusics] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const { user } = useAuth();

  async function fetchMusic() {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllMusic();
      // console.log(data.musics);
      setMusics(data.musics);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to fetch music.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getMusics = () => fetchMusic();
    getMusics();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }
  async function handleLike(id) {
    try {
      const data = await toggleLike(id);

      setMusics((prev) =>
        prev.map((music) => {
          if (music._id !== id) {
            return music;
          }

          const updatedLikes = data.isLiked
            ? [...music.likes, user._id]
            : music.likes.filter((likeId) => likeId?.toString() !== user._id);

          return {
            ...music,
            likes: updatedLikes,
          };
        }),
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PageLayout
      title="All Music"
      subtitle="Discover new tracks from the community."
    >
      <div className={styles.grid}>
        {musics.map((music) => {
          const isLiked = music.likes.some(
            (likeId) => likeId?.toString() === user._id,
          );

          return (
            <MusicCard
              key={music._id}
              music={music}
              isLiked={isLiked}
              onLike={handleLike}
            />
          );
        })}
      </div>
    </PageLayout>
  );
};

export default Home;
