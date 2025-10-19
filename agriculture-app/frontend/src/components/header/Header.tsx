"use client";
import Link from "next/link";
import styles from "./Header.module.css";
import { FaBars, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";

const Header = () => {
  const [bagCount, setBagCount] = useState(0);

  useEffect(() => {
    // Update bag count on mount
    updateBagCount();

    // Listen for bag updates
    const handleBagUpdate = () => {
      updateBagCount();
    };

    window.addEventListener("bagUpdated", handleBagUpdate);

    return () => {
      window.removeEventListener("bagUpdated", handleBagUpdate);
    };
  }, []);

  const updateBagCount = () => {
    const bag = JSON.parse(localStorage.getItem("shoppingBag") || "[]");
    setBagCount(bag.length);
  };

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
        <div className={styles.cartContainer}>
          <FaShoppingCart className={styles.icon} />
          {bagCount > 0 && <span className={styles.badge}>{bagCount}</span>}
        </div>
        <FaUserCircle className={styles.icon} />
      </div>
    </header>
  );
};

export default Header;
