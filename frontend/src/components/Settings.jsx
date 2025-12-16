import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Settings({ onClose }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [productSource, setProductSource] = useState('multi-store');
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentConfig, setCurrentConfig] = useState(null);

  // All available models
  const allModels = {
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

  // Load current configuration on mount
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  // Update available models when provider changes
  useEffect(() => {
    const models = allModels[provider] || [];
    setAvailableModels(models);

    // Set default model if not already selected
    if (!selectedModel || !models.find(m => m.id === selectedModel)) {
      const mainModel = models.find(m => m.isMain);
      if (mainModel) {
        setSelectedModel(mainModel.id);
      }
    }
  }, [provider]);

  const loadCurrentConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/config`);
      if (response.data.success) {
        const config = response.data.config;
        setCurrentConfig(config);
        setProvider(config.provider || 'gemini');
        setSelectedModel(config.model || '');
        setProductSource(config.productSource || 'multi-store');

        if (config.apiKeyConfigured) {
          setMessage({
            type: 'info',
            text: `Current API key: ${config.apiKeyPreview}`
          });
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    if (!selectedModel) {
      setMessage({ type: 'error', text: 'Please select a model' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/api/config`, {
        provider,
        apiKey: apiKey.trim(),
        model: selectedModel,
        productSource
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully! You can now use the app.'
        });

        // Clear API key input for security
        setApiKey('');

        // Reload current config to show updated preview
        setTimeout(() => {
          loadCurrentConfig();
        }, 500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save settings'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">API Settings</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Config Info */}
          {currentConfig?.apiKeyConfigured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Current Configuration:</strong> {currentConfig.provider} - {currentConfig.model}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                API Key: {currentConfig.apiKeyPreview}
              </p>
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select AI Provider
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  provider === 'gemini'
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg font-bold text-gray-800">Google Gemini</div>
                <div className="text-xs text-gray-500 mt-1">Gemini API</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('groq')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  provider === 'groq'
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg font-bold text-gray-800">Groq</div>
                <div className="text-xs text-gray-500 mt-1">Groq Cloud API</div>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider === 'gemini' ? 'Google Gemini' : 'Groq'} API key`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              {provider === 'gemini' ? (
                <>
                  Get your API key from{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </>
              ) : (
                <>
                  Get your API key from{' '}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Groq Console
                  </a>
                </>
              )}
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            >
              <option value="">Choose a model...</option>
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Source Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Source
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProductSource('multi-store')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  productSource === 'multi-store'
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg font-bold text-gray-800">Multi-Store Links</div>
                <div className="text-xs text-gray-500 mt-1">5 shopping platforms</div>
                <div className="text-xs text-green-600 mt-1 font-semibold">Recommended</div>
              </button>

              <button
                type="button"
                onClick={() => setProductSource('google-shopping')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  productSource === 'google-shopping'
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg font-bold text-gray-800">Google Shopping</div>
                <div className="text-xs text-gray-500 mt-1">Real product images</div>
                <div className="text-xs text-blue-600 mt-1 font-semibold">Requires API</div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {productSource === 'multi-store' ? (
                <>
                  Users get links to Amazon, eBay, Etsy, Walmart & Target - No extra API needed!
                </>
              ) : (
                <>
                  Uses Google Custom Search API for real product images (setup required in backend .env)
                </>
              )}
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
