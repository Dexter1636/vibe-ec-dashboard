'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 focus:ring-violet-500 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30',
  gradient: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 focus:ring-purple-500 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30',
  secondary: 'bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500 shadow-md hover:shadow-lg',
  outline: 'border-2 border-violet-500 text-violet-600 hover:bg-violet-50 focus:ring-violet-500',
  ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
  danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
