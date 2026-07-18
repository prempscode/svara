import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

import styles from "./MusicCard.module.css";

function MusicCard({
  music,
  isLiked,
  onLike,
  showLike = true,
  showLikeCount = true,
}) {
  return (
    <div className={styles.card}>
      <Link to={`/music/${music._id}`} className={styles.imageWrapper}>
        <img
          src={
            music.image ||
            "https://placehold.co/600x600/1c1c1e/ffffff?text=Music"
          }
          alt={music.title}
          className={styles.image}
          width={200}
          loading="lazy"
        />
      </Link>

      <div className={styles.content}>
        <Link to={`/music/${music._id}`} className={styles.title}>
          {music.title}
        </Link>

        <Link
          to={`/users/${music.artist._id}`}
          className={styles.artist}
          onClick={(e) => e.stopPropagation()}
        >
          {music.artist.username}
        </Link>

        {showLike && (
          <div className={styles.footer}>
            <button
              className={styles.likeButton}
              onClick={() => onLike?.(music._id)}
            >
              <FiHeart size={18} fill={isLiked ? "#0A84FF" : "none"} />

              {showLikeCount && music.likes.length}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicCard;
