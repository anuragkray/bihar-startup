"use client";
import React, { useState, use, useEffect } from "react";
import styles from "./shop.module.css";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";

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
        price: "₹26.80/Kg",
        image: "", // Will be loaded from API
        description: "Premium quality wheat seeds with high yield",
      },
      {
        id: 2,
        name: "Paddy Seeds",
        price: "₹23.00/Kg",
        image: "",
        description: "Hybrid rice seeds for better production",
      },
      {
        id: 3,
        name: "Corn Seeds",
        price: "₹26/kg",
        image: "",
        description: "Disease-resistant corn seeds",
      },
      {
        id: 4,
        name: "Sugarcane Seeds",
        price: "₹3.0/Kg",
        image: "",
        description: "Sugarcane seeds bundle",
      },
      {
        id: 5,
        name: "Mustard Seeds",
        price: "₹60/kg",
        image: "₹",
        description: "High oil content mustard seeds",
      },
      {
        id: 6,
        name: "Pearl Millet Seeds",
        price: "₹120/kg",
        image: "",
        description: "Various pulse seeds for cultivation",
      },
    ],
  },
  "fertilizer-shop": {
    title: "Fertilizer Shop",
    description: "Quality fertilizers for healthy crops",
    products: [
      {
        id: 1,
        name: "Urea",
        price: "₹267-bag/45kg",
        image: "",
        description:
          "High nitrogen content fertilizer for enhanced crop growth",
      },
      {
        id: 2,
        name: "Potash",
        price: "₹630-bag/50kg",
        image: "",
        description: "Potassium-rich fertilizer for improved crop quality",
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
};

interface PageProps {
  params: Promise<{
    product: string;
  }>;
}

// Product Card Component
const ProductCard = ({
  product,
  isFirst,
  shopCategory,
}: {
  product: any;
  isFirst?: boolean;
  shopCategory: string;
}) => {
  if (!product.image) {
    return null; // Don't render if no image
  }

  return (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={300}
          className={styles.productImage}
          priority={isFirst}
          loading={isFirst ? undefined : "lazy"}
          unoptimized
        />
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>
          {product.name}
        </h3>
        <p className={styles.productDescription}>
          {product.description}
        </p>
        <div className={styles.productFooter}>
          <span className={styles.productPrice}>
            {product.price}
          </span>
          <Link href={`/${shopCategory}/${product.id}`}>
            <button className={styles.buyButton}>Purchase</button>
          </Link>
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

  // Helper function to format shop name for breadcrumb
  const formatShopName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/km-agri-dashboard' },
    { label: formatShopName(product), href: `/${product}` },
  ];

  return (
    <div className={styles.shopPage}>
      <div className={styles.shopContainer}>
        <Breadcrumb items={breadcrumbItems} />
        
        <div className={styles.shopHeader}>
          <h1 className={styles.shopTitle}>{shopInfo.title}</h1>
          <p className={styles.shopDescription}>{shopInfo.description}</p>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {loading
          ? shopInfo.products.map((prod: any, index: number) => (
              <ProductCard
                key={prod.id}
                product={{
                  ...prod,
                }}
                isFirst={index === 0}
                shopCategory={product}
              />
            ))
          : products.map((prod: any, index: number) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isFirst={index === 0}
                shopCategory={product}
              />
            ))}
      </div>
    </div>
  );
};

export default ShopPage;
