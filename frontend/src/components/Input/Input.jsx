import styles from "./Input.module.css";

const Input = ({ label, error, helperText, className = "", ...props }) => {
  return (
    <div className={`${styles.group} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}

      <input
        className={`${styles.input} ${error ? styles.errorInput : ""}`}
        {...props}
      />

      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        helperText && <p className={styles.helper}>{helperText}</p>
      )}
    </div>
  );
};

export default Input;
