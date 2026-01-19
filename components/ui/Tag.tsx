'use client';

import React from 'react';

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onRemove,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1.5 focus:outline-none hover:opacity-70"
          type="button"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
