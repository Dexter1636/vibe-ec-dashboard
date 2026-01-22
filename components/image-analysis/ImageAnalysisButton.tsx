'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface ImageAnalysisButtonProps {
  productId: string;
  imageIndex: number;
  isAnalyzing: boolean;
  hasResult: boolean;
  onAnalyze: () => void;
}

export const ImageAnalysisButton: React.FC<ImageAnalysisButtonProps> = ({
  productId,
  imageIndex,
  isAnalyzing,
  hasResult,
  onAnalyze,
}) => {
  if (isAnalyzing) {
    return (
      <Button size="sm" variant="outline" disabled className="w-full">
        <span className="mr-2 animate-spin">⏳</span>
        分析中...
      </Button>
    );
  }

  if (hasResult) {
    return (
      <Button size="sm" variant="outline" className="w-full" onClick={onAnalyze}>
        <span className="mr-1">🔄</span>
        重新分析
      </Button>
    );
  }

  return (
    <Button size="sm" className="w-full" onClick={onAnalyze}>
      <span className="mr-1">🔍</span>
      AI图片分析
    </Button>
  );
};
