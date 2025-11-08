import ProductDetailClient from '@/components/product-detail/ProductDetailClient';
import { productDetailData } from '@/components/product-detail/productDetailData';

interface PageProps {
  params: Promise<{
    product: string;
    productId: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { product, productId } = await params;
  const shopInfo = productDetailData[product];
  const productData = shopInfo?.products.find((p: any) => p.id === parseInt(productId));

  return <ProductDetailClient product={product} productId={productId} productData={productData} />;
}
