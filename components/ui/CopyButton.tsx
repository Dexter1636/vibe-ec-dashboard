'use client';

import React, { useState } from 'react';
import { Button } from './Button';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 'sm',
  variant = 'outline',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <span className="mr-1">✓</span>
          已复制
        </>
      ) : (
        <>
          <span className="mr-1">📋</span>
          复制
        </>
      )}
    </Button>
  );
};
