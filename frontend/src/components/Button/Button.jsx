import styles from "./Button.module.css";

const Button = ({
  children,
  variant = "primary",
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${fullWidth ? styles.full : ""}
      `}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
