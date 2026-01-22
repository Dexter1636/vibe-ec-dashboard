'use client';

import React, { useEffect, useState } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 30,
  className = '',
}) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{displayed}</span>;
};
