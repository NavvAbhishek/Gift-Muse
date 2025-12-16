import { useState } from 'react';
import axios from 'axios';
import SearchForm from './components/SearchForm';
import GiftCard from './components/GiftCard';
import Settings from './components/Settings';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // State management
  const [gifts, setGifts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedDescription, setSearchedDescription] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Handle gift search
   * Calls backend API to get gift recommendations
   */
  const handleSearch = async (description) => {
    // Reset states
    setIsLoading(true);
    setError(null);
    setGifts([]);
    setSearchedDescription(description);

    try {
      console.log('🔍 Searching for gifts...');
      console.log('📝 Description:', description);
      console.log('🌐 API URL:', `${API_URL}/api/recommend`);

      // Make API request
      const response = await axios.post(`${API_URL}/api/recommend`, {
        description: description
      });

      console.log('✅ Response received:', response.data);

      // Check if response is successful
      if (response.data.success && response.data.data && response.data.data.gifts) {
        setGifts(response.data.data.gifts);
        console.log(`🎁 Found ${response.data.data.gifts.length} gifts`);

        // Scroll to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (err) {
      console.error('❌ Error:', err);

      // Handle different error types
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data.message || err.response.data.error || 'Failed to get gift recommendations';
        setError(errorMessage);
        console.error('Server error:', err.response.status, errorMessage);
      } else if (err.request) {
        // Request made but no response
        setError('Unable to connect to the server. Please make sure the backend is running on ' + API_URL);
        console.error('Network error: No response from server');
      } else {
        // Other errors
        setError(err.message || 'An unexpected error occurred');
        console.error('Error:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle search again (clear results)
   */
  const handleSearchAgain = () => {
    setGifts([]);
    setError(null);
    setSearchedDescription('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Settings Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>API Settings</span>
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
            🎁 GiftWhisperer
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered gift recommendations tailored to your loved ones
          </p>
        </header>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block">
              <div className="loader border-8 border-primary-500 border-t-transparent rounded-full w-16 h-16 mb-4"></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Finding Perfect Gifts...
            </h3>
            <p className="text-gray-600">
              Our AI is analyzing preferences and searching for the best matches
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span>Generating ideas</span>
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span>Searching products</span>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={handleSearchAgain}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {gifts.length > 0 && !isLoading && (
          <div id="results-section" className="mt-12 animate-fade-in">
            {/* Results Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Perfect Gift Ideas
              </h2>
              <p className="text-gray-600 mb-1">
                Based on: <span className="font-medium text-gray-800">"{searchedDescription}"</span>
              </p>
              <button
                onClick={handleSearchAgain}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2 mx-auto transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Search for different person</span>
              </button>
            </div>

            {/* Gift Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gifts.map((gift, index) => (
                <GiftCard key={index} gift={gift} index={index} />
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 text-center bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-8 border border-primary-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Found the perfect gift?
              </h3>
              <p className="text-gray-600 mb-4">
                Click "View on eBay" to purchase, or search again for more ideas!
              </p>
              <button
                onClick={handleSearchAgain}
                className="btn-primary"
              >
                Find More Gifts
              </button>
            </div>
          </div>
        )}

        {/* Empty State (Initial) */}
        {gifts.length === 0 && !isLoading && !error && (
          <div className="text-center py-12 text-gray-500 animate-fade-in">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <p className="text-lg">
              Enter a description above to discover amazing gift ideas!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>
            Powered by{' '}
            <span className="font-semibold text-primary-600">AI</span>
            {' '}&{' '}
            <span className="font-semibold text-accent-600">eBay</span>
          </p>
          <p className="mt-2">
            GiftWhisperer © 2025 - Find the perfect gift with AI
          </p>
        </footer>
      </div>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
