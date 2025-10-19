"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ShopContainer.module.css";
import CommingSoonCard from "@/components/coming-soon/CommingSoonCard";

const items = [
  { id: 1, name: "Seeds Shop", image: "/images/Seeds.jpg", comingSoon: false },
  {
    id: 2,
    name: "Fertilizer Shop",
    image: "/images/Fertilizer_Image.jpg",
    comingSoon: false,
  },
  {
    id: 3,
    name: "Pesticide Shop",
    image: "/images/Pesticide.jpg",
    comingSoon: true,
  },
  {
    id: 4,
    name: "Farming Equipment Shop",
    image: "/images/Farming_Equipment.jpg",
    comingSoon: true,
  },
  {
    id: 5,
    name: "Tractor Shop",
    image: "/images/Tractor_Image.jpeg",
    comingSoon: true,
  },
  {
    id: 6,
    name: "Irrigation Shop",
    image: "/images/Irrigation_Product_Image.jpg",
    comingSoon: true,
  },
];

const ShopContainer = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleShopClick = (item: (typeof items)[0]) => {
    if (item.comingSoon) {
      setShowComingSoon(true);
    }
  };

  return (
    <div className={styles.shopContainer}>
      <div className={styles.backgroundBlur}></div>
      <div className={styles.itemList}>
        {items.map((item) => {
          const product = encodeURIComponent(
            item.name.toLowerCase().replace(/\s+/g, "-")
          );

          return (
            <div
              key={item.id}
              className={styles.item}
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className={styles.itemContent}>
                {item.comingSoon ? (
                  <button
                    className={styles.shopButton}
                    onClick={() => handleShopClick(item)}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link className={styles.shopButton} href={`/${product}`}>
                    {item.name}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showComingSoon && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={() => setShowComingSoon(false)}
            >
              ×
            </button>
            <CommingSoonCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopContainer;
