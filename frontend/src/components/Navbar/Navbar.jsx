import { NavLink, useNavigate } from "react-router-dom";
import {
  FiMusic,
  FiHome,
  FiHeart,
  FiDisc,
  FiUpload,
  FiPlusSquare,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <NavLink to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <FiMusic size={18} />
          </div>

          <span>Music</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/liked">Liked</NavLink>

          <NavLink to="/albums">Albums</NavLink>

          <NavLink to="/upload">Upload</NavLink>

          <NavLink to="/create-album">Create Album</NavLink>
        </nav>

        <div className={styles.right}>
          <NavLink to="/profile" className={styles.profile}>
            <FiUser size={18} />
            <span>{user?.username}</span>
          </NavLink>

          <button onClick={handleLogout} className={styles.logout}>
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
