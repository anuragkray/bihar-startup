import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <p>© 2025 KM Agri. All rights reserved.</p>
        </div>
        <div className={styles.footerSection}>
          <p>Contact: +91 993-131-4058</p>
          <p>Email: info@kmagri.in</p>
        </div>
        <div className={styles.footerSection}>
          <p>
            Address: 402 Ravi urmila complex, Ashiyana digha road Patna 800025{" "}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
