import Link from "next/link";
import styles from "./ShopContainer.module.css";

const items = [
  { id: 1, name: "Seeds Shop", image: "/images/Seeds.jpg" },
  { id: 2, name: "Pesticide Shop", image: "/images/Pesticide.jpg" },
  {
    id: 3,
    name: "Farming Equipment Shop",
    image: "/images/Farming_Equipment.jpg",
  },
  { id: 4, name: "Tractor Shop", image: "/images/Tractor_Image.jpeg" },
  {
    id: 5,
    name: "Irrigation Shop",
    image: "/images/Irrigation_Product_Image.jpg",
  },
  { id: 6, name: "Fertilizer Shop", image: "/images/Fertilizer_Image.jpg" },
  { id: 7, name: "Comming Soon", image: "/images/Comming_Soon_Image.jpg" },
];

const ShopContainer = () => {
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
                {/* ✅ Now linking directly to `/${slug}` since `[product]` is in `app/` */}
                <Link className={styles.shopButton} href={`/${product}`}>
                  {item.name}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopContainer;
