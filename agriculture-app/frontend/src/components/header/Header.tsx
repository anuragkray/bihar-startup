import Link from "next/link";
import styles from "./Header.module.css";
import { FaBars, FaShoppingCart, FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/km-agri-dashboard" className={styles.link}>
          <FaBars className={styles.icon} />
        </Link>
        <Link href="/km-agri-dashboard" className={styles.link}>
          <h1 className={styles.title}>KM Agri</h1>
        </Link>
      </div>
      <div className={styles.right}>
        <FaShoppingCart className={styles.icon} />
        <FaUserCircle className={styles.icon} />
      </div>
    </header>
  );
};

export default Header;
