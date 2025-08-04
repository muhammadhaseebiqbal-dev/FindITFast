import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* App Icon */}
      <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
        <svg 
          className="w-10 h-10 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>

      {/* App Title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
        FindItFast
      </h1>

      {/* App Tagline */}
      <p className="text-gray-600 text-base mb-12 font-normal">
        Find Items. Fast.
      </p>

      {/* Loading Dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-gray-800 rounded-full loading-dots"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dots"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full loading-dots"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
