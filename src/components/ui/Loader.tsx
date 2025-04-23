import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  color = 'purple-700',
  fullScreen = false,
  message
}) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-2',
    large: 'h-16 w-16 border-3'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center'
    : 'flex items-center justify-center h-full w-full';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div 
          className={`animate-spin rounded-full ${sizeClasses[size]} border-2`}
          style={{ 
            borderTopColor: 'var(--purple-700, rgb(126, 34, 206))', 
            borderLeftColor: 'var(--purple-700, rgb(126, 34, 206))',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderRadius: '50%' 
          }}
          role="status"
          aria-label="Loading"
        />
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loader; 