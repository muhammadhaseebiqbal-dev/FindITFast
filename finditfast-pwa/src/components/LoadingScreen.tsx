import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4">
      {/* App Icon */}
      <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
        <svg 
          className="w-12 h-12 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>

      {/* App Title */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
        FindItFast
      </h1>

      {/* App Tagline */}
      <p className="text-purple-700 text-lg mb-12 font-semibold">
        Find Items. Fast.
      </p>

      {/* Loading Dots */}
      <div className="flex space-x-3">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full loading-dots"></div>
        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full loading-dots"></div>
        <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full loading-dots"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
