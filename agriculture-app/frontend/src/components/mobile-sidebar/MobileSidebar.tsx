"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./MobileSidebar.module.css";
import { FaTimes, FaHome, FaSeedling, FaTractor, FaTools, FaWater, FaFlask, FaShoppingCart, FaUser, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import { useUser } from "@/context/UserContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useUser();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
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

  const menuItems = [
    { icon: FaHome, label: "Home", href: "/km-agri-dashboard" },
    { icon: FaSeedling, label: "Seeds Shop", href: "/seeds-shop" },
    { icon: FaTractor, label: "Farming Equipment", href: "/farming-equipment" },
    { icon: FaTools, label: "Tools", href: "/tools" },
    { icon: FaWater, label: "Irrigation", href: "/irrigation" },
    { icon: FaFlask, label: "Fertilizers & Pesticides", href: "/fertilizers-pesticides" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayActive : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.logo}>KM Agri</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        {isAuthenticated && user ? (
          <div className={styles.userProfile}>
            {user.profilePhoto ? (
              <Image
                src={user.profilePhoto}
                alt={user.name}
                width={60}
                height={60}
                className={styles.profilePhoto}
              />
            ) : (
              <div className={styles.avatar}>{getUserInitials()}</div>
            )}
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>{user.name}</h3>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        ) : (
          <div className={styles.guestProfile}>
            <FaUser className={styles.guestIcon} />
            <p className={styles.guestText}>Please login to continue</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={styles.navigation}>
          <ul className={styles.menuList}>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className={styles.menuItem} onClick={onClose}>
                  <item.icon className={styles.menuIcon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Actions */}
        {isAuthenticated && (
          <div className={styles.userActions}>
            <Link href="/cart" className={styles.actionItem} onClick={onClose}>
              <FaShoppingCart className={styles.actionIcon} />
              <span>My Cart</span>
            </Link>
            <Link href="/profile" className={styles.actionItem} onClick={onClose}>
              <FaUser className={styles.actionIcon} />
              <span>My Profile</span>
            </Link>
            <Link href="/orders" className={styles.actionItem} onClick={onClose}>
              <FaClipboardList className={styles.actionIcon} />
              <span>My Orders</span>
            </Link>
            <button className={styles.actionItem} onClick={handleLogout}>
              <FaSignOutAlt className={styles.actionIcon} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileSidebar;
