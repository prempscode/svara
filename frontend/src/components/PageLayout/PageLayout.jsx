import styles from "./PageLayout.module.css";

const PageLayout = ({ title, subtitle, children }) => {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1>{title}</h1>

        {subtitle && <p>{subtitle}</p>}
      </div>

      {children}
    </main>
  );
};

export default PageLayout;
