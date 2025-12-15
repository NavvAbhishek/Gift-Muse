/**
 * Unsplash Image Service
 * Fetches real product images from Unsplash API (free tier)
 *
 * Setup: Get free API key from https://unsplash.com/developers
 * Free tier: 50 requests/hour
 */

import dotenv from 'dotenv';
dotenv.config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

// Fallback placeholder images
const FALLBACK_IMAGES = {
  default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2RjE7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdpZnQgSWRlYTwvdGV4dD48L3N2Zz4='
};

/**
 * Check if Unsplash is configured
 */
export function isUnsplashConfigured() {
  return UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY.trim() !== '';
}

/**
 * Fetch image from Unsplash based on search query
 */
export async function fetchUnsplashImage(query) {
  if (!isUnsplashConfigured()) {
    console.log('⚠️ Unsplash API not configured, using fallback image');
    return FALLBACK_IMAGES.default;
  }

  try {
    // Clean up query for better image search
    const cleanQuery = query
      .replace(/vintage|antique|retro|modern|premium|luxury/gi, '')
      .trim();

    const searchQuery = cleanQuery || query;

    console.log(`📸 Fetching Unsplash image for: "${searchQuery}"`);

    const apiUrl = new URL('https://api.unsplash.com/search/photos');
    apiUrl.searchParams.append('query', searchQuery);
    apiUrl.searchParams.append('per_page', '1');
    apiUrl.searchParams.append('orientation', 'squarish');

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      console.error(`❌ Unsplash API error: ${response.status}`);
      return FALLBACK_IMAGES.default;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log(`✅ Found Unsplash image`);
      return imageUrl;
    } else {
      console.log('⚠️ No Unsplash results, using fallback');
      return FALLBACK_IMAGES.default;
    }

  } catch (error) {
    console.error('❌ Unsplash fetch error:', error.message);
    return FALLBACK_IMAGES.default;
  }
}

/**
 * Fetch multiple images in parallel
 */
export async function fetchMultipleUnsplashImages(queries) {
  console.log('📸 Fetching Unsplash images for products...');

  const imagePromises = queries.map(queryObj =>
    fetchUnsplashImage(queryObj.query)
  );

  const images = await Promise.all(imagePromises);

  console.log(`✅ Fetched ${images.length} product images`);
  return images;
}
