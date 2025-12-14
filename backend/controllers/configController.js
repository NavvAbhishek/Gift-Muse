import { getConfig, updateConfig, AVAILABLE_MODELS, isConfigured } from '../services/configManager.js';

// Get current configuration
export async function getCurrentConfig(req, res) {
  try {
    const config = getConfig();

    // Don't send the full API key to frontend for security
    const safeConfig = {
      provider: config.provider,
      model: config.model,
      productSource: config.productSource || 'multi-store',
      apiKeyConfigured: isConfigured(),
      apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : ''
    };

    res.json({
      success: true,
      config: safeConfig,
      availableModels: AVAILABLE_MODELS
    });
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get configuration'
    });
  }
}


// Update configuration
export async function updateConfiguration(req, res) {
  try {
    const { provider, apiKey, model, productSource } = req.body;

    // Validate required fields
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: 'Provider is required'
      });
    }

    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }

    // Update configuration
    const newConfig = updateConfig({
      provider,
      apiKey,
      model: model || (provider === 'gemini' ? 'gemini-2.5-flash-lite' : 'llama-3.3-70b-versatile'),
      productSource: productSource || 'multi-store'
    });

    console.log(`✅ Configuration updated: Provider=${newConfig.provider}, Model=${newConfig.model}, ProductSource=${newConfig.productSource}`);

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config: {
        provider: newConfig.provider,
        model: newConfig.model,
        productSource: newConfig.productSource,
        apiKeyConfigured: true,
        apiKeyPreview: `${apiKey.substring(0, 8)}...`
      }
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update configuration'
    });
  }
}


// Get available models for a provider
export async function getModelsForProvider(req, res) {
  try {
    const { provider } = req.params;

    if (!['gemini', 'groq'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Must be "gemini" or "groq"'
      });
    }

    const models = AVAILABLE_MODELS[provider];

    res.json({
      success: true,
      provider,
      models
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get models'
    });
  }
}
