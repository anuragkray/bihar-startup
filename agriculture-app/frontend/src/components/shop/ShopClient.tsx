'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/common/km-agri-breadcrumb/Breadcrumb';
import { Button } from '@/components/common';
import styles from './ShopClient.module.css';
import { shopData } from './shopData';

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

interface ProductCardProps {
  product: any;
  isFirst?: boolean;
  shopCategory: string;
}

const ProductCard = ({ product, isFirst, shopCategory }: ProductCardProps) => {
  if (!product.image) {
    return null;
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
          loading={isFirst ? undefined : 'lazy'}
          unoptimized
        />
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDescription}>{product.description}</p>
        <div className={styles.productFooter}>
          <span className={styles.productPrice}>{product.price}</span>
          <Link href={`/${shopCategory}/${product.id}`}>
            <Button variant="primary" size="small">
              Purchase
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

interface ShopClientProps {
  product: string;
  shopInfo: any;
}

export default function ShopClient({ product, shopInfo }: ShopClientProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopInfo && shopInfo.products.length > 0) {
      const loadImages = async () => {
        const productsWithImages = await Promise.all(
          shopInfo.products.map(async (prod: any) => {
            const imageUrls = await fetchImageUrls(prod.name);
            return { ...prod, image: imageUrls[0], images: imageUrls };
          })
        );
        setProducts(productsWithImages);
        setLoading(false);
      };
      loadImages();
    }
  }, [shopInfo]);

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

  const formatShopName = (slug: string) => {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
                product={{ ...prod }}
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
}
