import { NextRequest, NextResponse } from 'next/server';

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;


const productImageNames: Record<string, string[]> = {
  "wheat-seeds": [
    "wheat_fcub16.jpg",
    "wheat_2_s3thjf.jpg",
    "wheat_1_pjurfu.jpg",
  ],
  "paddy-seeds": ["paddy_m5zcm7.jpg", "rice_1_tztdva.jpg", "rice_2_gimjva.jpg"],
  "corn-seeds": [
    "maize_hwxutd.jpg",
    "maize_1_fxtuwc.jpg",
    "maize_2_ynqtzj.jpg",
    "maize_3_grzpef.jpg",
  ],
  sugarcane: ["sugarcane_1_nszvwz.jpg", "sugarcane_ngsqa1.jpg"],
  "mustard-seeds": [
    "mustard_uy08ca.jpg",
    "mustard_1_frzxn2.jpg",
    "mustard_3_cabnfc.jpg",
  ],
  "pearl-millet-seeds": ["bazara_sen0vl.jpg", "perl_millet_2_h2wsce.jpg"],

  // Pesticide Shop
  "insecticide-spray": [],
  fungicide: [],
  herbicide: [],
  "organic-pesticide": [],
  rodenticide: [],
  nematicide: [],

  // Farming Equipment Shop
  plough: [],
  cultivator: [],
  "seed-drill": [],
  harvester: [],
  sprayer: [],
  thresher: [],

  // Tractor Shop
  "mini-tractor-25hp": [],
  "medium-tractor-40hp": [],
  "heavy-tractor-60hp": [],
  "tractor-trolley": [],
  "rotavator-attachment": [],
  "tractor-loader": [],

  // Irrigation Shop
  "drip-irrigation-kit": [],
  "sprinkler-system": [],
  "water-pump": [],
  "pvc-pipes": [],
  "water-tank": [],
  "irrigation-timer": [],

  // Fertilizer Shop
  "npk-fertilizer": [],
  urea: [],
  dap: [],
  "organic-compost": [],
  potash: [],
  "micronutrient-mix": [],
};

// Fallback image URL - simple placeholder
const FALLBACK_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// Helper function to generate Cloudinary image URL
function getCloudinaryImageUrl(imageName: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${imageName}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productName: string }> }
) {
  try {
    const { productName } = await params;

    // Convert product name to key format (lowercase, replace spaces with hyphens)
    const key = productName.toLowerCase().replace(/\s+/g, "-");

    // Get image names array from mapping
    const imageNames = productImageNames[key];

    // If image names not found or empty, return fallback
    if (!imageNames || imageNames.length === 0) {
      return NextResponse.json({
        images: [FALLBACK_IMAGE_URL],
        source: "fallback",
        message: "Cloudinary images not configured for this product",
      });
    }

    // Convert all image names to Cloudinary URLs
    const imageUrls = imageNames.map((imageName) =>
      getCloudinaryImageUrl(imageName)
    );

    return NextResponse.json({
      images: imageUrls,
      source: "cloudinary",
      productName: productName,
      key: key,
      count: imageUrls.length,
    });
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    return NextResponse.json(
      {
        images: [FALLBACK_IMAGE_URL],
        source: "fallback",
        error: "Failed to fetch image URLs",
      },
      { status: 500 }
    );
  }
}
