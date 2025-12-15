import { generateGiftQueries } from '../services/aiService.js';
import { scrapeMultipleQueries } from '../services/scraperService.js';
import { createMultiStoreProducts } from '../services/multiStoreService.js';
import { searchGoogleShoppingProducts, isGoogleShoppingConfigured } from '../services/googleShoppingService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Main controller for gift recommendations
 * Orchestrates AI service and product search services
 */

/**
 * POST /api/recommend
 * Generate personalized gift recommendations based on user description
 *
 * @route POST /api/recommend
 * @param {Object} req.body - Request body
 * @param {string} req.body.description - Description of the gift recipient
 * @returns {Object} JSON response with gift recommendations
 */
export async function getGiftRecommendations(req, res) {
  try {
    const { description } = req.body;

    // Validation: Check if description is provided
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Description is required',
        message: 'Please provide a description of the person you want to find gifts for.'
      });
    }

    // Validation: Check description length
    if (description.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Description too short',
        message: 'Please provide a more detailed description (at least 5 characters).'
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Description too long',
        message: 'Please keep your description under 500 characters.'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎁 NEW GIFT RECOMMENDATION REQUEST');
    console.log('='.repeat(60));
    console.log(`📝 Description: "${description}"`);
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60) + '\n');

    // Step 1: Generate gift queries using AI
    console.log('Step 1/2: Generating gift ideas with AI...');
    const queries = await generateGiftQueries(description);
    console.log(`✅ Generated ${queries.length} gift queries\n`);

    // Step 2: Get products based on configured source
    const productSource = process.env.PRODUCT_SOURCE || 'multi-store';
    console.log(`Step 2/2: Finding products using "${productSource}" method...`);

    let gifts;

    switch (productSource) {
      case 'google-shopping':
        if (isGoogleShoppingConfigured()) {
          gifts = await searchGoogleShoppingProducts(queries);
          console.log(`✅ Found ${gifts.length} products via Google Shopping\n`);
        } else {
          console.log('⚠️ Google Shopping not configured, falling back to multi-store...');
          gifts = await createMultiStoreProducts(queries);
          console.log(`✅ Created ${gifts.length} multi-store recommendations\n`);
        }
        break;

      case 'mock':
        // Use legacy mock mode from scraper service
        process.env.MOCK_MODE = 'true';
        gifts = await scrapeMultipleQueries(queries);
        console.log(`✅ Created ${gifts.length} mock products\n`);
        break;

      case 'ebay-scraping':
        // Legacy eBay scraping (not recommended)
        console.log('⚠️ Using legacy eBay scraping (may fail)...');
        process.env.MOCK_MODE = 'false';
        gifts = await scrapeMultipleQueries(queries);
        console.log(`✅ Found ${gifts.length} products from eBay\n`);
        break;

      case 'multi-store':
      default:
        gifts = await createMultiStoreProducts(queries);
        console.log(`✅ Created ${gifts.length} multi-store recommendations\n`);
        break;
    }

    console.log('='.repeat(60));
    console.log('✨ REQUEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60) + '\n');

    // Return successful response
    return res.status(200).json({
      success: true,
      message: 'Gift recommendations generated successfully',
      data: {
        description: description,
        totalResults: gifts.length,
        gifts: gifts
      }
    });

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR IN GIFT CONTROLLER');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(60) + '\n');

    // Return error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate gift recommendations. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/health
 * Health check endpoint for the gift API
 */
export function healthCheck(req, res) {
  const productSource = process.env.PRODUCT_SOURCE || 'multi-store';

  return res.status(200).json({
    success: true,
    message: 'Gift recommendation API is healthy',
    timestamp: new Date().toISOString(),
    productSource: productSource,
    googleShoppingConfigured: isGoogleShoppingConfigured(),
    legacyMockMode: process.env.MOCK_MODE === 'true'
  });
}
