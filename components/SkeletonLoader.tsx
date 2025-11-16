import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-dark-3 ${className}`} />
  );
};
