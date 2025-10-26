"use client";
import React, { useState, use, useEffect } from "react";
import styles from "./productDetail.module.css";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/hooks/useCart";

// Helper function to get image URLs from API
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

// Product data (same as in shop page)
const shopData: Record<string, any> = {
  "seeds-shop": {
    title: "Seeds Shop",
    products: [
      {
        id: 1,
        name: "Wheat Seeds",
        price: 2680,
        unit: "Quintal",
        image: "",
        description: "Premium quality wheat seeds with high yield. These seeds are specially selected for their superior germination rate and disease resistance. Ideal for all soil types and climatic conditions.",
        features: [
          "High germination rate (>95%)",
          "Disease resistant variety",
          "Suitable for all soil types",
          "Excellent yield potential",
          "Certified quality seeds"
        ]
      },
      {
        id: 2,
        name: "Paddy Seeds",
        price: 2300,
        unit: "Quintal",
        image: "",
        description: "Hybrid rice seeds for better production with enhanced grain quality and pest resistance.",
        features: [
          "Hybrid variety",
          "High yield potential",
          "Pest resistant",
          "Good grain quality",
          "Suitable for wet cultivation"
        ]
      },
      {
        id: 3,
        name: "Corn Seeds",
        price: 450,
        unit: "kg",
        image: "",
        description: "Disease-resistant corn seeds with excellent yield and quality.",
        features: [
          "Disease resistant",
          "High yield",
          "Good grain quality",
          "Drought tolerant",
          "Fast growing variety"
        ]
      },
      {
        id: 4,
        name: "Sugarcane",
        price: 300,
        unit: "pack",
        image: "",
        description: "Premium sugarcane seeds for high sugar content and better yield.",
        features: [
          "High sugar content",
          "Disease resistant",
          "Good tillering",
          "Suitable for all regions",
          "Long harvesting period"
        ]
      },
      {
        id: 5,
        name: "Mustard Seeds",
        price: 400,
        unit: "kg",
        image: "",
        description: "High oil content mustard seeds for commercial cultivation.",
        features: [
          "High oil content",
          "Disease resistant",
          "Good yield",
          "Suitable for winter season",
          "Premium quality"
        ]
      },
      {
        id: 6,
        name: "Pearl Millet Seeds",
        price: 550,
        unit: "kg",
        image: "",
        description: "Drought-resistant pearl millet seeds for dry regions.",
        features: [
          "Drought resistant",
          "High nutritional value",
          "Good yield",
          "Suitable for dry regions",
          "Fast growing"
        ]
      },
    ],
  },
  // Add other categories as needed
};

interface PageProps {
  params: Promise<{
    product: string;
    productId: string;
  }>;
}

const ProductDetailPage = ({ params }: PageProps) => {
  const { product, productId } = use(params);
  const { user, isAuthenticated } = useUser();
  const { addToCart } = useCart(user?._id?.toString() ?? null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [weightKg, setWeightKg] = useState<string>("1");
  const [weightGrams, setWeightGrams] = useState<string>("0");
  const [weightInput, setWeightInput] = useState<string>("");
  const [useDropdown, setUseDropdown] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const shopInfo = shopData[product];
  const productData = shopInfo?.products.find(
    (p: any) => p.id === parseInt(productId)
  );

  useEffect(() => {
    if (productData) {
      const loadImages = async () => {
        const imageUrls = await fetchImageUrls(productData.name);
        setImages(imageUrls);
        setLoading(false);
      };
      loadImages();
    }
  }, [productData]);

  if (!productData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product not found</h2>
        <Link href={`/${product}`} className={styles.backButton}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, "");

    // Validate max 50 kg
    const numValue = parseFloat(value);
    if (value === "" || (numValue >= 0 && numValue <= 50)) {
      setWeightInput(value);
      // Switch to input mode when user starts typing
      if (value !== "") {
        setUseDropdown(false);
      }
    }
  };

  const handleWeightKgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeightKg(e.target.value);
    setUseDropdown(true);
    setWeightInput(""); // Clear input when dropdown is used
  };

  const handleWeightGramsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeightGrams(e.target.value);
    setUseDropdown(true);
    setWeightInput(""); // Clear input when dropdown is used
  };

  const handleAddToBag = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      return;
    }

    // Calculate weight in kg
    let totalWeight: number | undefined;
    if (useDropdown) {
      // Using dropdown: convert kg and grams to total kg
      const kg = parseFloat(weightKg) || 0;
      const grams = parseFloat(weightGrams) || 0;
      totalWeight = kg + grams / 1000;
    } else if (weightInput) {
      // Using manual input
      totalWeight = parseFloat(weightInput);
    }

    // Validate weight
    if (totalWeight && totalWeight > 50) {
      alert("Weight cannot exceed 50 kg");
      return;
    }

    setAddingToCart(true);
    try {
      const success = await addToCart({
        productId: productData.id.toString(),
        productName: productData.name,
        quantity: 1,
        price: productData.price,
        weight: totalWeight,
      });

      if (success) {
        // Dispatch custom event to update header
        window.dispatchEvent(new Event("bagUpdated"));
        alert("Item added to cart!");

        // Reset weight inputs after successful add
        setWeightInput("");
        setWeightKg("1");
        setWeightGrams("0");
        setUseDropdown(true);
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        <Link href={`/${product}`} className={styles.backLink}>
          ← Back to {shopInfo.title}
        </Link>

        <div className={styles.productDetailContainer}>
          {/* Left Side - Image Carousel */}
          <div className={styles.imageSection}>
            <div className={styles.mainImageContainer}>
              {loading ? (
                <div className={styles.imageSkeleton}></div>
              ) : images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex]}
                    alt={productData.name}
                    width={600}
                    height={600}
                    className={styles.mainImage}
                    unoptimized
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        className={`${styles.carouselButton} ${styles.prevButton}`}
                        onClick={prevImage}
                      >
                        ‹
                      </button>
                      <button
                        className={`${styles.carouselButton} ${styles.nextButton}`}
                        onClick={nextImage}
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.noImage}>No image available</div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${
                      index === currentImageIndex ? styles.activeThumbnail : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={img}
                      alt={`${productData.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className={styles.thumbnailImage}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className={styles.detailsSection}>
            <h1 className={styles.productTitle}>{productData.name}</h1>
            <div className={styles.priceSection}>
              <span className={styles.price}>
                ₹{productData.price}/{productData.unit}
              </span>
            </div>

            <div className={styles.description}>
              <h3>Description</h3>
              <p>{productData.description}</p>
            </div>

            {productData.features && (
              <div className={styles.features}>
                <h3>Key Features</h3>
                <ul>
                  {productData.features.map(
                    (feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Weight Selection */}
            <div className={styles.selectionSection}>
              <div className={styles.weightSection}>
                <div className={styles.inputGroup}>
                  <label htmlFor="weightInput">Pleas Enter Weight (kg)</label>
                  <input
                    type="text"
                    id="weightInput"
                    value={weightInput}
                    onChange={handleWeightInputChange}
                    className={styles.quantityInput}
                    placeholder="Enter weight (max 50 kg)"
                    disabled={
                      useDropdown && (weightKg !== "1" || weightGrams !== "0")
                    }
                  />
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Max 50 kg allowed
                  </small>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    margin: "10px 0",
                    color: "#666",
                  }}
                >
                  OR
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="weightKg">Select Weight (kg)</label>
                  <select
                    id="weightKg"
                    value={weightKg}
                    onChange={handleWeightKgChange}
                    className={styles.weightSelect}
                    disabled={!useDropdown && weightInput !== ""}
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((kg) => (
                      <option key={kg} value={kg}>
                        {kg} kg
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="weightGrams">Select Weight</label>
                  <select
                    id="weightGrams"
                    value={weightGrams}
                    onChange={handleWeightGramsChange}
                    className={styles.weightSelect}
                    disabled={!useDropdown && weightInput !== ""}
                  >
                    <option value="0">0 g</option>
                    {Array.from({ length: 9 }, (_, i) => (i + 1) * 100).map(
                      (grams) => (
                        <option key={grams} value={grams}>
                          {grams} g
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <button
                className={styles.addToBagButton}
                onClick={handleAddToBag}
                disabled={addingToCart || !isAuthenticated}
              >
                {addingToCart
                  ? "Adding..."
                  : !isAuthenticated
                  ? "Login to Add to Cart"
                  : "Add to Bag"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
