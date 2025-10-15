"use client";
import React, { useState, use } from "react";
import styles from "./shop.module.css";
import Link from "next/link";

// Define product data for each shop category
const shopData: Record<string, any> = {
  "seeds-shop": {
    title: "Seeds Shop",
    description: "High-quality seeds for all your farming needs",
    products: [
      {
        id: 1,
        name: "Wheat Seeds",
        price: "₹500/kg",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&q=80",
        description: "Premium quality wheat seeds with high yield",
      },
      {
        id: 2,
        name: "Rice Seeds",
        price: "₹600/kg",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop&q=80",
        description: "Hybrid rice seeds for better production",
      },
      {
        id: 3,
        name: "Corn Seeds",
        price: "₹450/kg",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=600&fit=crop&q=80",
        description: "Disease-resistant corn seeds",
      },
      {
        id: 4,
        name: "Vegetable Seeds",
        price: "₹300/pack",
        image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&h=600&fit=crop&q=80",
        description: "Mixed vegetable seeds pack",
      },
      {
        id: 5,
        name: "Mustard Seeds",
        price: "₹400/kg",
        image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&h=600&fit=crop&q=80",
        description: "High oil content mustard seeds",
      },
      {
        id: 6,
        name: "Pulse Seeds",
        price: "₹550/kg",
        image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&h=600&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80",
        description: "Broad-spectrum insect control",
      },
      {
        id: 2,
        name: "Fungicide",
        price: "₹400/liter",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop&q=80",
        description: "Prevents fungal diseases",
      },
      {
        id: 3,
        name: "Herbicide",
        price: "₹300/liter",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop&q=80",
        description: "Effective weed control solution",
      },
      {
        id: 4,
        name: "Organic Pesticide",
        price: "₹500/liter",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80",
        description: "Eco-friendly pest control",
      },
      {
        id: 5,
        name: "Rodenticide",
        price: "₹250/pack",
        image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=600&fit=crop&q=80",
        description: "Rodent control solution",
      },
      {
        id: 6,
        name: "Nematicide",
        price: "₹450/liter",
        image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&h=600&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80",
        description: "Heavy-duty plough for soil preparation",
      },
      {
        id: 2,
        name: "Cultivator",
        price: "₹8,000",
        image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&h=600&fit=crop&q=80",
        description: "Multi-purpose cultivator",
      },
      {
        id: 3,
        name: "Seed Drill",
        price: "₹12,000",
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop&q=80",
        description: "Precision seed planting equipment",
      },
      {
        id: 4,
        name: "Harvester",
        price: "₹25,000",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80",
        description: "Manual harvesting tool",
      },
      {
        id: 5,
        name: "Sprayer",
        price: "₹3,500",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80",
        description: "Agricultural sprayer for pesticides",
      },
      {
        id: 6,
        name: "Thresher",
        price: "₹15,000",
        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&h=600&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&h=600&fit=crop&q=80",
        description: "Compact tractor for small farms",
      },
      {
        id: 2,
        name: "Medium Tractor 40HP",
        price: "₹5,50,000",
        image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&h=600&fit=crop&q=80",
        description: "Versatile medium-sized tractor",
      },
      {
        id: 3,
        name: "Heavy Tractor 60HP",
        price: "₹8,00,000",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80",
        description: "High-power tractor for large fields",
      },
      {
        id: 4,
        name: "Tractor Trolley",
        price: "₹75,000",
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop&q=80",
        description: "Heavy-duty tractor trolley",
      },
      {
        id: 5,
        name: "Rotavator Attachment",
        price: "₹45,000",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop&q=80",
        description: "Tractor-mounted rotavator",
      },
      {
        id: 6,
        name: "Tractor Loader",
        price: "₹1,20,000",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80",
        description: "Complete drip irrigation system",
      },
      {
        id: 2,
        name: "Sprinkler System",
        price: "₹12,000",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80",
        description: "Automatic sprinkler irrigation",
      },
      {
        id: 3,
        name: "Water Pump",
        price: "₹15,000",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&q=80",
        description: "High-efficiency water pump",
      },
      {
        id: 4,
        name: "PVC Pipes",
        price: "₹150/meter",
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop&q=80",
        description: "Durable irrigation pipes",
      },
      {
        id: 5,
        name: "Water Tank",
        price: "₹20,000",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&q=80",
        description: "Large capacity water storage",
      },
      {
        id: 6,
        name: "Irrigation Timer",
        price: "₹2,500",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop&q=80",
        description: "Balanced NPK formula 19-19-19",
      },
      {
        id: 2,
        name: "Urea",
        price: "₹600/bag",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80",
        description: "High nitrogen content fertilizer",
      },
      {
        id: 3,
        name: "DAP",
        price: "₹1,200/bag",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop&q=80",
        description: "Di-ammonium phosphate fertilizer",
      },
      {
        id: 4,
        name: "Organic Compost",
        price: "₹400/bag",
        image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&h=600&fit=crop&q=80",
        description: "100% organic compost",
      },
      {
        id: 5,
        name: "Potash",
        price: "₹900/bag",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop&q=80",
        description: "Potassium-rich fertilizer",
      },
      {
        id: 6,
        name: "Micronutrient Mix",
        price: "₹500/kg",
        image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=600&fit=crop&q=80",
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
const ProductCard = ({ product }: { product: any }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    // Check if image is already loaded (from cache)
    if (imgRef.current?.complete) {
      setImageLoaded(true);
    }
  }, []);

  return (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        {!imageLoaded && <div className={styles.shimmer}></div>}
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          className={`${styles.productImage} ${imageLoaded ? styles.loaded : styles.loading}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
      <div className={styles.productInfo}>
        <h3 className={`${styles.productName} ${!imageLoaded ? styles.shimmerText : ''}`}>
          {product.name}
        </h3>
        <p className={`${styles.productDescription} ${!imageLoaded ? styles.shimmerText : ''}`}>
          {product.description}
        </p>
        <div className={styles.productFooter}>
          <span className={`${styles.productPrice} ${!imageLoaded ? styles.shimmerText : ''}`}>
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
  const shopInfo = shopData[product];

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
        {shopInfo.products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
