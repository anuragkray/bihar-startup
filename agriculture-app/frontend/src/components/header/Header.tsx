"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { FaBars, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import AuthModal from "@/components/auth/AuthModal";

const Header = () => {
  const [bagCount, setBagCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useUser();

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

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <>
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
          <Link href="/cart" className={styles.cartContainer}>
            <FaShoppingCart className={styles.icon} />
            {bagCount > 0 && <span className={styles.badge}>{bagCount}</span>}
          </Link>

          <div className={styles.userSection}>
            <div className={styles.userIconContainer} onClick={handleUserIconClick}>
              {isAuthenticated && user ? (
                <>
                  {user.profilePhoto ? (
                    <Image
                      src={user.profilePhoto}
                      alt={user.name}
                      width={40}
                      height={40}
                      className={styles.profilePhoto}
                    />
                  ) : (
                    <div className={styles.avatar}>{getUserInitials()}</div>
                  )}
                  <span className={styles.userName}>{user.name.split(" ")[0]}</span>
                </>
              ) : (
                <>
                  <FaUserCircle className={styles.icon} />
                  <span className={styles.loginText}>Login</span>
                </>
              )}
            </div>

            {showUserMenu && isAuthenticated && (
              <div className={styles.userMenu}>
                <Link href="/profile" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                  My Profile
                </Link>
                <Link href="/orders" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                  My Orders
                </Link>
                <button onClick={handleLogout} className={styles.menuItem}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
