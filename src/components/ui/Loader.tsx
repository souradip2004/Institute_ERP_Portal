import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  color = 'purple-700' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-2',
    large: 'h-16 w-16 border-3'
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-${color} border-${color} border-opacity-20`}
        style={{ borderTopColor: 'rgb(216, 180, 254)', borderRadius: '50%' }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Loader; 