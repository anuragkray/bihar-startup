import styles from "./Header.module.css";
import { FaBars, FaShoppingCart, FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <FaBars className={styles.icon} />
        <h1 className={styles.title}>KM Agri</h1>
      </div>
      <div className={styles.right}>
        <FaShoppingCart className={styles.icon} />
        <FaUserCircle className={styles.icon} />
      </div>
    </header>
  );
};

export default Header;
