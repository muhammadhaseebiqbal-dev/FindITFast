import React from 'react';

interface ArrivedButtonProps {
  onArrived: () => void;
}

export const ArrivedButton: React.FC<ArrivedButtonProps> = ({ onArrived }) => {
  const handleClick = () => {
    onArrived();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 shadow-sm"
      aria-label="I've arrived at the store"
    >
      <div className="w-6 h-6">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-lg">I've Arrived</span>
    </button>
  );
};