"use client";
import React, { useState, use, useEffect } from "react";
import styles from "./shop.module.css";
import Link from "next/link";
import Image from "next/image";

// Helper function to get image URLs from API (returns array of images)
async function fetchImageUrls(productName: string): Promise<string[]> {
  try {
    const response = await fetch(
      `/api/images/${encodeURIComponent(productName)}`
    );
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return [];
  }
}

// Define product data for each shop category
const shopData: Record<string, any> = {
  "seeds-shop": {
    title: "Seeds Shop",
    description: "High-quality seeds for all your farming needs",
    products: [
      {
        id: 1,
        name: "Wheat Seeds",
        price: "₹2680/Quintal",
        image: "", // Will be loaded from API
        description: "Premium quality wheat seeds with high yield",
      },
      {
        id: 2,
        name: "Paddy Seeds",
        price: "₹2300/Quintal",
        image: "",
        description: "Hybrid rice seeds for better production",
      },
      {
        id: 3,
        name: "Corn Seeds",
        price: "₹450/kg",
        image: "",
        description: "Disease-resistant corn seeds",
      },
      {
        id: 4,
        name: "Sugarcane",
        price: "₹300/pack",
        image: "",
        description: "Mixed vegetable seeds pack",
      },
      {
        id: 5,
        name: "Mustard Seeds",
        price: "₹400/kg",
        image: "",
        description: "High oil content mustard seeds",
      },
      {
        id: 6,
        name: "Pearl Millet Seeds",
        price: "₹550/kg",
        image: "",
        description: "Various pulse seeds for cultivation",
      },
    ],
  },
  "pesticide-shop": {
    title: "Pesticide Shop",
    description: "Effective pesticides for crop protection",
    products: [
      {
        id: 1,
        name: "Insecticide Spray",
        price: "₹350/liter",
        image: "",
        description: "Broad-spectrum insect control",
      },
      {
        id: 2,
        name: "Fungicide",
        price: "₹400/liter",
        image: "",
        description: "Prevents fungal diseases",
      },
      {
        id: 3,
        name: "Herbicide",
        price: "₹300/liter",
        image: "",
        description: "Effective weed control solution",
      },
      {
        id: 4,
        name: "Organic Pesticide",
        price: "₹500/liter",
        image: "",
        description: "Eco-friendly pest control",
      },
      {
        id: 5,
        name: "Rodenticide",
        price: "₹250/pack",
        image: "",
        description: "Rodent control solution",
      },
      {
        id: 6,
        name: "Nematicide",
        price: "₹450/liter",
        image: "",
        description: "Controls nematode infestations",
      },
    ],
  },
  "farming-equipment-shop": {
    title: "Farming Equipment Shop",
    description: "Modern farming equipment and tools",
    products: [
      {
        id: 1,
        name: "Plough",
        price: "₹5,000",
        image: "",
        description: "Heavy-duty plough for soil preparation",
      },
      {
        id: 2,
        name: "Cultivator",
        price: "₹8,000",
        image: "",
        description: "Multi-purpose cultivator",
      },
      {
        id: 3,
        name: "Seed Drill",
        price: "₹12,000",
        image: "",
        description: "Precision seed planting equipment",
      },
      {
        id: 4,
        name: "Harvester",
        price: "₹25,000",
        image: "",
        description: "Manual harvesting tool",
      },
      {
        id: 5,
        name: "Sprayer",
        price: "₹3,500",
        image: "",
        description: "Agricultural sprayer for pesticides",
      },
      {
        id: 6,
        name: "Thresher",
        price: "₹15,000",
        image: "",
        description: "Grain threshing machine",
      },
    ],
  },
  "tractor-shop": {
    title: "Tractor Shop",
    description: "Powerful tractors for all farming operations",
    products: [
      {
        id: 1,
        name: "Mini Tractor 25HP",
        price: "₹3,50,000",
        image: "",
        description: "Compact tractor for small farms",
      },
      {
        id: 2,
        name: "Medium Tractor 40HP",
        price: "₹5,50,000",
        image: "",
        description: "Versatile medium-sized tractor",
      },
      {
        id: 3,
        name: "Heavy Tractor 60HP",
        price: "₹8,00,000",
        image: "",
        description: "High-power tractor for large fields",
      },
      {
        id: 4,
        name: "Tractor Trolley",
        price: "₹75,000",
        image: "",
        description: "Heavy-duty tractor trolley",
      },
      {
        id: 5,
        name: "Rotavator Attachment",
        price: "₹45,000",
        image: "",
        description: "Tractor-mounted rotavator",
      },
      {
        id: 6,
        name: "Tractor Loader",
        price: "₹1,20,000",
        image: "",
        description: "Front-end loader attachment",
      },
    ],
  },
  "irrigation-shop": {
    title: "Irrigation Shop",
    description: "Modern irrigation systems and equipment",
    products: [
      {
        id: 1,
        name: "Drip Irrigation Kit",
        price: "₹8,000",
        image: "",
        description: "Complete drip irrigation system",
      },
      {
        id: 2,
        name: "Sprinkler System",
        price: "₹12,000",
        image: "",
        description: "Automatic sprinkler irrigation",
      },
      {
        id: 3,
        name: "Water Pump",
        price: "₹15,000",
        image: "",
        description: "High-efficiency water pump",
      },
      {
        id: 4,
        name: "PVC Pipes",
        price: "₹150/meter",
        image: "",
        description: "Durable irrigation pipes",
      },
      {
        id: 5,
        name: "Water Tank",
        price: "₹20,000",
        image: "",
        description: "Large capacity water storage",
      },
      {
        id: 6,
        name: "Irrigation Timer",
        price: "₹2,500",
        image: "",
        description: "Automatic irrigation controller",
      },
    ],
  },
  "fertilizer-shop": {
    title: "Fertilizer Shop",
    description: "Quality fertilizers for healthy crops",
    products: [
      {
        id: 1,
        name: "NPK Fertilizer",
        price: "₹800/bag",
        image: "",
        description: "Balanced NPK formula 19-19-19",
      },
      {
        id: 2,
        name: "Urea",
        price: "₹600/bag",
        image: "",
        description: "High nitrogen content fertilizer",
      },
      {
        id: 3,
        name: "DAP",
        price: "₹1,200/bag",
        image: "",
        description: "Di-ammonium phosphate fertilizer",
      },
      {
        id: 4,
        name: "Organic Compost",
        price: "₹400/bag",
        image: "",
        description: "100% organic compost",
      },
      {
        id: 5,
        name: "Potash",
        price: "₹900/bag",
        image: "",
        description: "Potassium-rich fertilizer",
      },
      {
        id: 6,
        name: "Micronutrient Mix",
        price: "₹500/kg",
        image: "",
        description: "Essential micronutrients blend",
      },
    ],
  },
  "comming-soon": {
    title: "Coming Soon",
    description: "New products arriving soon",
    products: [],
  },
};

interface PageProps {
  params: Promise<{
    product: string;
  }>;
}

// Product Card Component with loading state
const ProductCard = ({
  product,
  isFirst,
}: {
  product: any;
  isFirst?: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product.image) {
    return null; // Don't render if no image
  }

  return (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        {!imageLoaded && <div className={styles.shimmer}></div>}
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={300}
          className={`${styles.productImage} ${
            imageLoaded ? styles.loaded : styles.loading
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error("Image load error for:", product.name, product.image);
            setImageLoaded(true);
          }}
          priority={isFirst}
          loading={isFirst ? undefined : "lazy"}
          unoptimized
        />
      </div>
      <div className={styles.productInfo}>
        <h3
          className={`${styles.productName} ${
            !imageLoaded ? styles.shimmerText : ""
          }`}
        >
          {product.name}
        </h3>
        <p
          className={`${styles.productDescription} ${
            !imageLoaded ? styles.shimmerText : ""
          }`}
        >
          {product.description}
        </p>
        <div className={styles.productFooter}>
          <span
            className={`${styles.productPrice} ${
              !imageLoaded ? styles.shimmerText : ""
            }`}
          >
            {product.price}
          </span>
          <button className={styles.buyButton}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

const ShopPage = ({ params }: PageProps) => {
  const { product } = use(params);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const shopInfo = shopData[product];
  // Load images from API
  useEffect(() => {
    if (shopInfo && shopInfo.products.length > 0) {
      const loadImages = async () => {
        const productsWithImages = await Promise.all(
          shopInfo.products.map(async (prod: any) => {
            const imageUrls = await fetchImageUrls(prod.name);
            // Use the first image as the main product image
            return { ...prod, image: imageUrls[0], images: imageUrls };
          })
        );
        setProducts(productsWithImages);
        setLoading(false);
      };
      loadImages();
    }
  }, [shopInfo]);

  // If shop doesn't exist or is coming soon
  if (!shopInfo || shopInfo.products.length === 0) {
    return (
      <div className={styles.comingSoonContainer}>
        <div className={styles.comingSoonCard}>
          <h2>Coming Soon</h2>
          <p>We will soon be available in your location.</p>
          <p>
            Our team is actively working with the Bihar government to provide
            these facilities soon.
          </p>
          <Link href="/km-agri-dashboard" className={styles.backButton}>
            Back to Main market
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shopPage}>
      <div className={styles.shopHeader}>
        <Link href="/km-agri-dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
        <h1 className={styles.shopTitle}>{shopInfo.title}</h1>
        <p className={styles.shopDescription}>{shopInfo.description}</p>
      </div>

      <div className={styles.productsGrid}>
        {loading
          ? shopInfo.products.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                }}
                isFirst={index === 0}
              />
            ))
          : products.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                isFirst={index === 0}
              />
            ))}
      </div>
    </div>
  );
};

export default ShopPage;
