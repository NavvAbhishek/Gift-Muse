// Configuration manager for API settings
let currentConfig = {
  provider: 'gemini', 
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.5-flash-lite', // default model
  productSource: process.env.PRODUCT_SOURCE || 'multi-store' // 'multi-store' or 'google-shopping'
};

// Available models for each provider
export const AVAILABLE_MODELS = {
  gemini: [
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Main)', isMain: true },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', isMain: false },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', isMain: false }
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Main)', isMain: true },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', isMain: false },
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', isMain: false }
  ]
};


// Get the current configuration

export function getConfig() {
  return { ...currentConfig };
}

/**
 * Update the configuration
 * @param {Object} newConfig - New configuration object
 * @param {string} newConfig.provider - Provider name ('gemini' or 'groq')
 * @param {string} newConfig.apiKey - API key for the provider
 * @param {string} newConfig.model - Model ID to use
 * @param {string} newConfig.productSource - Product source ('multi-store' or 'google-shopping')
 */
export function updateConfig(newConfig) {
  if (newConfig.provider) {
    if (!['gemini', 'groq'].includes(newConfig.provider)) {
      throw new Error('Invalid provider. Must be "gemini" or "groq"');
    }
    currentConfig.provider = newConfig.provider;
  }

  if (newConfig.apiKey !== undefined) {
    currentConfig.apiKey = newConfig.apiKey;
  }

  if (newConfig.model) {
    // Validate model exists for the provider
    const provider = newConfig.provider || currentConfig.provider;
    const validModels = AVAILABLE_MODELS[provider].map(m => m.id);

    if (!validModels.includes(newConfig.model)) {
      throw new Error(`Invalid model for ${provider}. Must be one of: ${validModels.join(', ')}`);
    }

    currentConfig.model = newConfig.model;
  }

  if (newConfig.productSource) {
    if (!['multi-store', 'google-shopping'].includes(newConfig.productSource)) {
      throw new Error('Invalid product source. Must be "multi-store" or "google-shopping"');
    }
    currentConfig.productSource = newConfig.productSource;
    // Also update environment variable so gift controller can use it
    process.env.PRODUCT_SOURCE = newConfig.productSource;
  }

  return { ...currentConfig };
}


// Validate that API key is configured
export function isConfigured() {
  return currentConfig.apiKey && currentConfig.apiKey.trim() !== '';
}


//Get available models for a provider

export function getAvailableModels(provider) {
  return AVAILABLE_MODELS[provider] || [];
}
