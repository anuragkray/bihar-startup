import ShopClient from "@/components/shop/ShopClient";
import { shopData } from "@/components/shop/shopData";

interface PageProps {
  params: Promise<{
    product: string;
  }>;
}

export default async function ShopPage({ params }: PageProps) {
  const { product } = await params;
  const shopInfo = shopData[product];

  return <ShopClient product={product} shopInfo={shopInfo} />;
}
