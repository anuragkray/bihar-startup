import { NextRequest, NextResponse } from 'next/server';


const productImageIds: Record<string, string[]> = {
  // Seeds Shop
  "wheat-seeds": ["1reRrfhSsWzESmunJ5JxNTOWgOJL5vNlZ","1X1boqVCeLyjR7yglU-vjBHOPJnr9oJTJ"], // 
  "rice-seeds": [],
  "corn-seeds": [],
  "vegetable-seeds": [],
  "mustard-seeds": [],
  "pulse-seeds": [],

  // Pesticide Shop
  "insecticide-spray": [],
  "fungicide": [],
  "herbicide": [],
  "organic-pesticide": [],
  "rodenticide": [],
  "nematicide": [],

  // Farming Equipment Shop
  "plough": [],
  "cultivator": [],
  "seed-drill": [],
  "harvester": [],
  "sprayer": [],
  "thresher": [],

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
  "urea": [],
  "dap": [],
  "organic-compost": [],
  "potash": [],
  "micronutrient-mix": [],
};

// Fallback image URL - simple placeholder
const FALLBACK_IMAGE_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// Helper function to convert Google Drive file ID to direct image URL
function getGoogleDriveImageUrl(fileId: string): string {
  // Use thumbnail format which works better for public images
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productName: string }> }
) {
  try {
    const { productName } = await params;
    
    // Convert product name to key format (lowercase, replace spaces with hyphens)
    const key = productName.toLowerCase().replace(/\s+/g, "-");
    
    console.log('Product Name:', productName);
    console.log('Key:', key);
    console.log('Available keys:', Object.keys(productImageIds));
    
    // Get file IDs array from mapping
    const fileIds = productImageIds[key];
    
    console.log('File IDs for', key, ':', fileIds);
    
    // If file IDs not found or empty, return fallback
    if (!fileIds || fileIds.length === 0) {
      return NextResponse.json({
        images: [FALLBACK_IMAGE_URL],
        source: "fallback",
        message: "Google Drive images not configured for this product"
      });
    }
    
    // Convert all file IDs to Google Drive image URLs
    const imageUrls = fileIds.map(fileId => getGoogleDriveImageUrl(fileId));
    
    return NextResponse.json({
      images: imageUrls,
      source: "google-drive",
      productName: productName,
      key: key,
      count: imageUrls.length
    });
    
  } catch (error) {
    console.error('Error fetching image URLs:', error);
    return NextResponse.json(
      {
        images: [FALLBACK_IMAGE_URL],
        source: "fallback",
        error: "Failed to fetch image URLs"
      },
      { status: 500 }
    );
  }
}
