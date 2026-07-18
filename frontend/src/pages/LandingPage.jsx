import { Link } from "react-router-dom";

import Button from "../components/Button/Button";

import styles from "./LandingPage.module.css";

function LandingPage() {
  const features = [
    {
      title: "Upload Your Music",
      description:
        "Upload your favorite tracks with beautiful cover art and keep everything organized in one place.",
      image: "/images/Feature-1-Upload-Music.png",
    },
    {
      title: "Create Beautiful Albums",
      description:
        "Group your songs into albums and build collections that are easy to browse and share.",
      image: "/images/Feature-2-Create-Albums.png",
    },
    {
      title: "Discover New Music",
      description:
        "Explore tracks uploaded by other users and discover new artists from the community.",
      image: "/images/Feature-3-Discover-Music.png",
    },
    {
      title: "Build Your Profile",
      description:
        "Showcase your uploads, albums, and let others discover the music you've shared.",
      image: "/images/Feature-4-User-Profiles.png",
    },
  ];
  return (
    <main className={styles.page}>
      {/* navbar */}

      <header className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          Svara
        </Link>

        <div className={styles.navActions}>
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>

          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* hero */}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Your Personal Music Library</span>

          <h1>
            Your Music.
            <br />
            Beautifully Organized.
          </h1>

          <p>
            Upload your favorite tracks, create albums, discover music from
            others, and build a collection that is truly yours.
          </p>

          <div className={styles.heroButtons}>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </div>

        <div className={styles.heroImage}>
          <img src="/images/Hero-Image.png" alt="Svara Hero" />
        </div>
      </section>
      {/* features */}

      <section className={styles.features}>
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`${styles.feature} ${
              index % 2 === 1 ? styles.reverse : ""
            }`}
          >
            <div className={styles.featureImage}>
              <img src={feature.image} alt={feature.title} />
            </div>

            <div className={styles.featureContent}>
              <h2>{feature.title}</h2>

              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </section>
      {/* cta */}

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Share Your Music?</h2>

          <p>
            Join Svara today and start building your personal music library.
            Upload songs, create albums, and discover music from creators around
            the world.
          </p>

          <div className={styles.ctaButtons}>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </div>

        <div className={styles.ctaImage}>
          <img src="/images/Final-CTA-Section.png" alt="Join Svara" />
        </div>
      </section>

      {/* footer */}

      <footer className={styles.footer}>
        <h3>Svara</h3>

        <p>Upload. Organize. Discover.</p>

        <span>© 2026 Svara • Built by Prem Sahu</span>
      </footer>
    </main>
  );
}

export default LandingPage;
