//Google Shopping Search Service
//Uses Google Custom Search API to find real products with images and prices
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || '';
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || '';

// Fallback image
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2RjE7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdpZnQgSWRlYTwvdGV4dD48L3N2Zz4=';

/**
 * Check if Google Shopping is configured
 */
export function isGoogleShoppingConfigured() {
  return GOOGLE_API_KEY && SEARCH_ENGINE_ID;
}

/**
 * Search Google Shopping for a product
 */
async function searchGoogleShopping(query) {
  if (!isGoogleShoppingConfigured()) {
    console.log('⚠️ Google Shopping API not configured');
    return null;
  }

  try {
    console.log(`🔍 Searching Google Shopping for: "${query}"`);

    // Build Google Custom Search API URL
    const apiUrl = new URL('https://www.googleapis.com/customsearch/v1');
    apiUrl.searchParams.append('key', GOOGLE_API_KEY);
    apiUrl.searchParams.append('cx', SEARCH_ENGINE_ID);
    apiUrl.searchParams.append('q', query);
    apiUrl.searchParams.append('searchType', 'image'); // Get product images
    apiUrl.searchParams.append('num', '1'); // Get top result
    apiUrl.searchParams.append('safe', 'active');

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      console.error(`❌ Google API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('⚠️ No results found');
      return null;
    }

    const item = data.items[0];

    // Extract product information
    const product = {
      title: item.title || query,
      price: extractPrice(item.snippet) || 'Price varies',
      image: item.link || FALLBACK_IMAGE,
      link: item.image?.contextLink || item.link || `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: item.snippet || ''
    };

    console.log(`✅ Found: ${product.title.substring(0, 50)}...`);
    return product;

  } catch (error) {
    console.error('❌ Google Shopping error:', error.message);
    return null;
  }
}

/**
 * Extract price from snippet text
 */
function extractPrice(text) {
  if (!text) return null;

  // Look for price patterns like $19.99, €25.50, £30, etc.
  const pricePatterns = [
    /\$[\d,]+\.?\d*/,
    /€[\d,]+\.?\d*/,
    /£[\d,]+\.?\d*/,
    /USD?\s*[\d,]+\.?\d*/i,
    /[\d,]+\.?\d*\s*dollars?/i
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Create a product from Google Shopping search
 */
export async function createGoogleShoppingProduct(queryObj) {
  const { query, reason } = queryObj;

  const product = await searchGoogleShopping(query);

  if (product) {
    return {
      ...product,
      reason,
      searchQuery: query,
      source: 'google-shopping'
    };
  }

  // Fallback if search fails
  return {
    title: query.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    price: 'Price varies',
    image: FALLBACK_IMAGE,
    link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
    reason,
    searchQuery: query,
    source: 'google-shopping-fallback'
  };
}

/**
 * Process multiple queries with Google Shopping
 */
export async function searchGoogleShoppingProducts(queries) {
  console.log('🛍️ Searching Google Shopping for products...');

  const products = [];

  for (let i = 0; i < queries.length; i++) {
    const queryObj = queries[i];
    console.log(`  [${i + 1}/${queries.length}] ${queryObj.query}`);

    const product = await createGoogleShoppingProduct(queryObj);
    products.push(product);

    // Small delay to avoid rate limiting (if making multiple requests)
    if (i < queries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('✅ Google Shopping search complete');
  return products;
}
