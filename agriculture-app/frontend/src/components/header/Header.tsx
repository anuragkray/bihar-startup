"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { FaBars, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import AuthModal from "@/components/auth/AuthModal";
import MobileSidebar from "@/components/mobile-sidebar/MobileSidebar";

const Header = () => {
  const [bagCount, setBagCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch cart count from API if user is authenticated
    if (isAuthenticated && user?._id) {
      fetchCartCount();
    } else {
      setBagCount(0);
    }

    // Listen for bag updates
    const handleBagUpdate = () => {
      if (isAuthenticated && user?._id) {
        fetchCartCount();
      }
    };

    window.addEventListener("bagUpdated", handleBagUpdate);

    return () => {
      window.removeEventListener("bagUpdated", handleBagUpdate);
    };
  }, [isAuthenticated, user?._id]);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const fetchCartCount = async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`/api/users/cart/${user._id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBagCount(data.data.itemCount || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setBagCount(0);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.trim().split(" ").filter(n => n.length > 0);
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button
            className={styles.hamburgerButton}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars className={styles.icon} />
          </button>
          <Link href="/km-agri-dashboard" className={styles.link}>
            <h1 className={styles.title}>KM Agri</h1>
          </Link>
        </div>
        <div className={styles.right}>
          {isAuthenticated ? (
            <Link href="/cart" className={styles.cartContainer}>
              <FaShoppingCart className={styles.icon} />
              {bagCount > 0 && <span className={styles.badge}>{bagCount}</span>}
            </Link>
          ) : (
            <div
              className={styles.cartContainer}
              onClick={() => setShowAuthModal(true)}
              style={{ cursor: "pointer" }}
            >
              <FaShoppingCart className={styles.icon} />
            </div>
          )}

          <div className={styles.userSection} ref={userMenuRef}>
            <div
              className={styles.userIconContainer}
              onClick={handleUserIconClick}
            >
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
                  <span className={styles.userName}>
                    {user.name.split(" ")[0]}
                  </span>
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
                <Link
                  href="/profile"
                  className={styles.menuItem}
                  onClick={() => setShowUserMenu(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className={styles.menuItem}
                  onClick={() => setShowUserMenu(false)}
                >
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

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Header;
