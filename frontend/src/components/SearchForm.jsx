import { useState } from 'react';

// SearchForm Component
// Handles user input for person description and triggers gift search
 
function SearchForm({ onSearch, isLoading }) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');


// Validate description input
 
  const validateInput = (value) => {
    if (!value.trim()) {
      setError('Please describe the person you want to find gifts for');
      return false;
    }

    if (value.trim().length < 5) {
      setError('Please provide a more detailed description (at least 5 characters)');
      return false;
    }

    if (value.length > 500) {
      setError('Please keep your description under 500 characters');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateInput(description)) {
      onSearch(description);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setDescription(value);

    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
    }
  };

  
// Example descriptions for quick testing
   
  const examples = [
    "My dad who loves fishing and hates technology",
    "My best friend who is obsessed with coffee and cats",
    "My mom who enjoys gardening and yoga"
  ];

  
// Fill input with example
  
  const useExample = (example) => {
    setDescription(example);
    setError('');
  };

  return (
    <div className="card p-8 mb-12 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Describe the Person
          </h2>
          <p className="text-gray-600">
            Tell us about their interests, hobbies, or personality
          </p>
        </div>

        {/* Text Input */}
        <div>
          <textarea
            value={description}
            onChange={handleChange}
            placeholder="e.g., My sister who loves art, reading mystery novels, and drinking tea..."
            rows="4"
            disabled={isLoading}
            className={`input-field resize-none ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
            }`}
          />

          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className={description.length > 500 ? 'text-red-500' : 'text-gray-500'}>
              {description.length}/500 characters
            </span>

            {/* Error Message */}
            {error && (
              <span className="text-red-500 font-medium">
                {error}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="loader border-4 border-white border-t-transparent rounded-full w-5 h-5"></div>
              <span>Finding Perfect Gifts...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Find Gift Ideas</span>
            </>
          )}
        </button>

        {/* Example Buttons */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Or try an example:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => useExample(example)}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchForm;
