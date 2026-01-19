'use client';

import React from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  size?: TextareaSize;
}

const baseStyles = 'w-full rounded-xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all duration-200 placeholder:text-slate-400';

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, size = 'md', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseStyles} ${sizeStyles[size]} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
