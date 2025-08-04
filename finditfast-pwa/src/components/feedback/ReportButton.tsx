import React from 'react';

interface ReportButtonProps {
  type: 'missing' | 'moved' | 'found' | 'confirm';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  type,
  onClick,
  disabled = false,
  className = ''
}) => {
  const getButtonConfig = () => {
    switch (type) {
      case 'missing':
        return {
          text: 'Item Missing',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          ),
          bgColor: 'bg-red-600 hover:bg-red-700',
          textColor: 'text-white'
        };
      case 'moved':
        return {
          text: 'Item Moved',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ),
          bgColor: 'bg-orange-600 hover:bg-orange-700',
          textColor: 'text-white'
        };
      case 'found':
        return {
          text: 'Item Found',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ),
          bgColor: 'bg-green-600 hover:bg-green-700',
          textColor: 'text-white'
        };
      case 'confirm':
        return {
          text: 'Confirm Location',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          ),
          bgColor: 'bg-blue-600 hover:bg-blue-700',
          textColor: 'text-white'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-colors duration-200 min-h-[44px] touch-manipulation
        ${config.bgColor} ${config.textColor}
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 transform transition-transform
        ${className}
      `}
      type="button"
    >
      {config.icon}
      <span>{config.text}</span>
    </button>
  );
};