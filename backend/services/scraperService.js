import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const MOCK_MODE = process.env.MOCK_MODE === 'true';

// Fallback placeholder images as data URIs (works offline)
const PLACEHOLDER_IMAGES = {
  noImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
  noResults: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZWJlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZjU3MjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBSZXN1bHRzPC90ZXh0Pjwvc3ZnPg==',
  error: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZWJlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNkYzI2MjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=',
  gift1: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdpZnQgIzE8L3RleHQ+PC9zdmc+',
  gift2: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzEwQjk4MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdpZnQgIzI8L3RleHQ+PC9zdmc+',
  gift3: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0Y1OUUwQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdpZnQgIzM8L3RleHQ+PC9zdmc+'
};

/**
 * Search eBay for a specific keyword and return the top product
 * @param {string} keyword - Search query for eBay
 * @returns {Promise<Object>} Product object with {title, price, image, link}
 */
export async function searchEbay(keyword) {
  // MOCK MODE: Return fake data instantly (for development)
  if (MOCK_MODE) {
    console.log(`🎭 [MOCK MODE] Returning fake data for: "${keyword}"`);
    return generateMockProduct(keyword);
  }

  // REAL MODE: Perform actual eBay scraping
  console.log(`🔍 Scraping eBay for: "${keyword}"`);

  let browser;
  try {
    // Launch Puppeteer browser with better anti-detection
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br'
    });

    // Navigate to eBay search results
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}`;

    console.log(`🌐 Navigating to: ${searchUrl}`);

    // Navigate and wait for network to be mostly idle
    await page.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 45000
    });

    console.log('📄 Page loaded, waiting for products to appear...');

    // Wait for search results to be present on the page
    try {
      await page.waitForSelector('.s-item, .srp-results', {
        timeout: 10000
      });
      console.log('✓ Products section found');
    } catch (waitError) {
      console.log('⚠️ Products section not found, attempting to extract anyway...');
    }

    // Additional small delay to ensure stability
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('📄 Extracting product data...');

    // Extract product data with better error handling
    let product = null;
    try {
      product = await page.evaluate((noImagePlaceholder) => {
        // Try multiple selectors for different eBay layouts
        const selectors = [
          '.s-item',
          '.srp-results .s-item',
          '[data-view="mi:1686|iid:1"]'
        ];

        let items = [];
        for (const selector of selectors) {
          items = document.querySelectorAll(selector);
          if (items.length > 0) break;
        }

        if (items.length === 0) {
          return null;
        }

        // Skip the first item if it's a "Shop on eBay" header
        let firstItem = null;
        for (let item of items) {
          const title = item.querySelector('.s-item__title');
          if (title && !title.textContent.includes('Shop on eBay')) {
            firstItem = item;
            break;
          }
        }

        if (!firstItem) {
          return null;
        }

        // Extract title
        const titleElement = firstItem.querySelector('.s-item__title');
        const title = titleElement ? titleElement.textContent.trim() : 'No title';

        // Extract price
        const priceElement = firstItem.querySelector('.s-item__price');
        const price = priceElement ? priceElement.textContent.trim() : 'Price not available';

        // Extract image with multiple fallbacks
        let image = noImagePlaceholder;
        const imgElement = firstItem.querySelector('.s-item__image-img, img');
        if (imgElement) {
          // Try src first, then data-src for lazy loaded images
          image = imgElement.src || imgElement.getAttribute('data-src') || noImagePlaceholder;
        }

        // Extract link
        const linkElement = firstItem.querySelector('.s-item__link, a');
        const link = linkElement ? linkElement.href : '#';

        return { title, price, image, link };
      }, PLACEHOLDER_IMAGES.noImage);
    } catch (evalError) {
      console.error('⚠️ Evaluation error:', evalError.message);
      product = null;
    }

    await browser.close();

    // If no product found, return placeholder
    if (!product) {
      console.log('⚠️ No product found, returning placeholder');
      return {
        title: `No results found for "${keyword}"`,
        price: 'N/A',
        image: PLACEHOLDER_IMAGES.noResults,
        link: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}`
      };
    }

    console.log(`✅ Scraped product: ${product.title.substring(0, 50)}...`);
    return product;

  } catch (error) {
    console.error('❌ Scraper Error:', error.message);

    // Close browser if it's still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }

    // Return error placeholder
    return {
      title: `Error: Could not fetch results for "${keyword}"`,
      price: 'N/A',
      image: PLACEHOLDER_IMAGES.error,
      link: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}`,
      error: error.message
    };
  }
}

/**
 * Generate mock product data for development
 * @param {string} keyword - Search query
 * @returns {Object} Fake product data
 */
function generateMockProduct(keyword) {
  const mockProducts = [
    {
      title: `Premium ${keyword} - Limited Edition`,
      price: '$29.99',
      image: PLACEHOLDER_IMAGES.gift1,
      link: 'https://www.ebay.com/itm/mock-product-1'
    },
    {
      title: `Best Selling ${keyword} Gift Set`,
      price: '$45.00',
      image: PLACEHOLDER_IMAGES.gift2,
      link: 'https://www.ebay.com/itm/mock-product-2'
    },
    {
      title: `Handcrafted ${keyword} Collection`,
      price: '$67.50',
      image: PLACEHOLDER_IMAGES.gift3,
      link: 'https://www.ebay.com/itm/mock-product-3'
    }
  ];

  // Return a random mock product
  return mockProducts[Math.floor(Math.random() * mockProducts.length)];
}

/**
 * Scrape multiple eBay searches and return all products
 * @param {Array<Object>} queries - Array of {query, reason} objects from AI
 * @returns {Promise<Array>} Array of products with reasons
 */
export async function scrapeMultipleQueries(queries) {
  console.log(`🛒 Starting scraping for ${queries.length} queries...`);

  const results = [];

  // Scrape each query sequentially to avoid overwhelming eBay
  for (let i = 0; i < queries.length; i++) {
    const queryObj = queries[i];

    console.log(`\n📦 [${i + 1}/${queries.length}] Processing: "${queryObj.query}"`);

    const product = await searchEbay(queryObj.query);
    results.push({
      ...product,
      reason: queryObj.reason,
      searchQuery: queryObj.query
    });

    // Add random delay between requests (only in real mode) to appear more human
    if (!MOCK_MODE && i < queries.length - 1) {
      const delay = 2000 + Math.random() * 2000; // Random delay between 2-4 seconds
      console.log(`⏳ Waiting ${Math.round(delay / 1000)}s before next request...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log('\n✅ All scraping complete');
  return results;
}
