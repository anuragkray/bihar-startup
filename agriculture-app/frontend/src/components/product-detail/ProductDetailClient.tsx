'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/common/km-agri-breadcrumb/Breadcrumb';
import { Button, Input, Select } from '@/components/common';
import AuthModal from '@/components/auth/AuthModal';
import styles from './ProductDetailClient.module.css';

async function fetchImageUrls(productName: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/images/${encodeURIComponent(productName)}`);
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error('Error fetching image URLs:', error);
    return [];
  }
}

interface ProductDetailClientProps {
  product: string;
  productId: string;
  productData: any;
}

export default function ProductDetailClient({ product, productId, productData }: ProductDetailClientProps) {
  const { user, isAuthenticated } = useUser();
  const { addToCart } = useCart(user?._id?.toString() ?? null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [weightKg, setWeightKg] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [bagQuantity, setBagQuantity] = useState<string>('');
  const [useDropdown, setUseDropdown] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isFertilizerProduct = product === 'fertilizer-shop';

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
    const value = e.target.value.replace(/[^\d.]/g, '');
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 50)) {
      setWeightInput(value);
      if (value !== '') {
        setUseDropdown(false);
      }
    }
  };

  const handleWeightKgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeightKg(e.target.value);
    setUseDropdown(true);
    setWeightInput('');
  };

  const handleBagQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBagQuantity(e.target.value);
    setUseDropdown(true);
  };

  const handleAddToBag = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    let totalWeight: number | undefined;
    let quantity = 1;

    if (isFertilizerProduct) {
      quantity = parseInt(bagQuantity) || 0;
      if (quantity === 0) {
        toast.error('Please select number of bags');
        return;
      }
    } else {
      if (useDropdown) {
        const kg = parseFloat(weightKg) || 0;
        totalWeight = kg;
      } else if (weightInput) {
        totalWeight = parseFloat(weightInput);
      }

      if (totalWeight && totalWeight > 50) {
        toast.error('Weight cannot exceed 50 kg');
        return;
      }
    }

    setAddingToCart(true);
    try {
      const success = await addToCart({
        productId: productData.id.toString(),
        productName: productData.name,
        quantity: quantity,
        price: productData.price,
        weight: totalWeight,
      });

      if (success) {
        window.dispatchEvent(new Event('bagUpdated'));
        toast.success('Item added to cart!');
        setWeightInput('');
        setWeightKg('');
        setBagQuantity('');
        setUseDropdown(true);
      } else {
        toast.error('Failed to add item to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('An error occurred. Please try again.');
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

  const formatShopName = (slug: string) => {
    return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/km-agri-dashboard' },
    { label: formatShopName(product), href: `/${product}` },
    { label: productData.name, href: `/${product}/${productId}` },
  ];

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        <Breadcrumb items={breadcrumbItems} />

        <div className={styles.productDetailContainer}>
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
                      <button className={`${styles.carouselButton} ${styles.prevButton}`} onClick={prevImage}>
                        ‹
                      </button>
                      <button className={`${styles.carouselButton} ${styles.nextButton}`} onClick={nextImage}>
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.noImage}>No image available</div>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image src={img} alt={`${productData.name} ${index + 1}`} width={100} height={100} className={styles.thumbnailImage} unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  {productData.features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.selectionSection}>
              {isFertilizerProduct ? (
                <Select
                  id="bagQuantity"
                  label="Select Number of Bags"
                  value={bagQuantity}
                  onChange={handleBagQuantityChange}
                  options={[
                    { value: '', label: 'Please select number of bags' },
                    ...Array.from({ length: 10 }, (_, i) => ({
                      value: String(i + 1),
                      label: `${i + 1} ${i + 1 === 1 ? 'bag' : 'bags'}`,
                    })),
                  ]}
                  fullWidth
                />
              ) : (
                <>
                  <Input
                    type="text"
                    id="weightInput"
                    label="Please Enter Weight (kg)"
                    value={weightInput}
                    onChange={handleWeightInputChange}
                    placeholder="Enter weight (max 50 kg)"
                    disabled={useDropdown && weightKg !== ''}
                    helperText="Max 50 kg allowed"
                    fullWidth
                  />

                  <div style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>OR</div>

                  <Select
                    id="weightKg"
                    label="Select Weight (kg)"
                    value={weightKg}
                    onChange={handleWeightKgChange}
                    disabled={!useDropdown && weightInput !== ''}
                    options={[
                      { value: '', label: 'Please select weight (Kg)' },
                      ...Array.from({ length: 50 }, (_, i) => ({
                        value: String(i + 1),
                        label: `${i + 1} kg`,
                      })),
                    ]}
                    fullWidth
                  />
                </>
              )}

              <Button
                onClick={handleAddToBag}
                disabled={addingToCart || !isAuthenticated}
                loading={addingToCart}
                variant="primary"
                size="large"
                fullWidth
              >
                {!isAuthenticated ? 'Login to Add to Cart' : 'Add to Bag'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="login"
      />
    </div>
  );
}
