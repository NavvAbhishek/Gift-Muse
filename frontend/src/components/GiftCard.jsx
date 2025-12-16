import { useState } from 'react';

// GiftCard Component
// Displays a single gift recommendation with image, title, price, and AI reasoning

function GiftCard({ gift, index }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  
// Handle image load error
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  
// Handle image load success
  
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  
// Open product link in new tab
  
  const handleViewProduct = () => {
    if (gift.link && gift.link !== '#') {
      window.open(gift.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="card hover:scale-105 transform transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Product Image */}
      <div className="relative bg-gray-100 h-64 overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loader border-4 border-primary-500 border-t-transparent rounded-full w-10 h-10"></div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <svg
              className="w-16 h-16 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-500 text-sm">Image unavailable</span>
          </div>
        ) : (
          <img
            src={gift.image}
            alt={gift.title}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover"
          />
        )}

        {/* Price Badge */}
        {gift.price && gift.price !== 'N/A' && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-lg font-bold text-primary-600">{gift.price}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Product Title */}
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem]">
          {gift.title}
        </h3>

        {/* AI Reasoning */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-lg border border-primary-100">
          <div className="flex items-start gap-2">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1">
                Why this gift?
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {gift.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Search Query Tag */}
        {gift.searchQuery && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="italic">Search: {gift.searchQuery}</span>
          </div>
        )}

        {/* Multi-Store Links or Single Button */}
        {gift.platformLinks ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">
              Shop on:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={gift.platformLinks.amazon}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                🛒 Amazon
              </a>
              <a
                href={gift.platformLinks.ebay}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                📦 eBay
              </a>
              <a
                href={gift.platformLinks.etsy}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                🎨 Etsy
              </a>
              <a
                href={gift.platformLinks.walmart}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                🏪 Walmart
              </a>
            </div>
            <a
              href={gift.platformLinks.target}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              🎯 Target
            </a>
          </div>
        ) : (
          <button
            onClick={handleViewProduct}
            disabled={!gift.link || gift.link === '#'}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <span>View Product</span>
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default GiftCard;
