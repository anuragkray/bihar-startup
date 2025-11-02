import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Company Info */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>KM Agri</h3>
          <p className={styles.footerDescription}>
            Your trusted partner for quality agricultural products in Bihar.
            Empowering farmers with premium seeds, fertilizers, and farming equipment.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li><span className={styles.disabledLink}>Home</span></li>
            <li><span className={styles.disabledLink}>Seeds Shop</span></li>
            <li><span className={styles.disabledLink}>Fertilizer Shop</span></li>
            <li><span className={styles.disabledLink}>My Cart</span></li>
            <li><span className={styles.disabledLink}>My Orders</span></li>
            <li><span className={styles.disabledLink}>My Profile</span></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Customer Service</h3>
          <ul className={styles.footerLinks}>
            <li><span className={styles.disabledLink}>About Us</span></li>
            <li><span className={styles.disabledLink}>Contact Us</span></li>
            <li><span className={styles.disabledLink}>FAQ</span></li>
            <li><span className={styles.disabledLink}>Shipping Policy</span></li>
            <li><span className={styles.disabledLink}>Return Policy</span></li>
            <li><span className={styles.disabledLink}>Terms & Conditions</span></li>
            <li><span className={styles.disabledLink}>Privacy Policy</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Contact Us</h3>
          <div className={styles.contactInfo}>
            <p className={styles.contactItem}>
              <span>Phone: +91 993-131-4058</span>
            </p>
            <p className={styles.contactItem}>
              <span>Email: info@kmagri.in</span>
            </p>
            <p className={styles.contactItem}>
              <span>
                Address: 402 Ravi Urmila Complex,<br />
                Ashiyana Digha Road,<br />
                Patna 800025, Bihar
              </span>
            </p>
            <p className={styles.contactItem}>
              <span>
                Hours: Mon - Sat: 9:00 AM - 6:00 PM<br />
                Sunday: Closed
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <p>© 2025 KM Agri. All rights reserved.</p>
        <div className={styles.paymentMethods}>
          <span>We Accept: Credit Card | Debit Card | UPI | Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
