'use client';

import React from 'react';
import { GeneratedImage, IMAGE_STYLES } from '@/types';
import { Button } from '@/components/ui';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ImageResultCardProps {
  result: GeneratedImage;
  productName?: string;
  onDownload?: () => void;
  onCopyUrl?: () => void;
}

export const ImageResultCard: React.FC<ImageResultCardProps> = ({
  result,
  productName,
  onDownload,
  onCopyUrl,
}) => {
  const style = IMAGE_STYLES.find((s) => s.id === result.styleId);

  const handleDownload = async () => {
    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName || result.styleId}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      onDownload?.();
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请尝试右键图片另存为');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(result.imageUrl);
    onCopyUrl?.();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{style?.icon}</span>
            <div>
              <h4 className="text-sm font-bold text-violet-900">{style?.name}</h4>
              <p className="text-xs text-violet-600">
                {format(result.generatedAt, 'HH:mm:ss', { locale: zhCN })}
                {result.generationTime && ` · ${result.generationTime.toFixed(1)}s`}
              </p>
            </div>
          </div>
          {result.status === 'completed' && (
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                <span className="mr-1">🔗</span>
                复制链接
              </Button>
              <Button size="sm" variant="gradient" onClick={handleDownload}>
                <span className="mr-1">⬇️</span>
                下载图片
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Generating State */}
        {result.status === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-violet-900">AI 正在绘图中...</p>
              <p className="text-xs text-gray-500">预计需要 30-120 秒</p>
              <div className="flex items-center justify-center space-x-1 mt-3">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Completed State - Show Image */}
        {result.status === 'completed' && (
          <div className="space-y-3">
            {/* Generated Image */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={result.imageUrl}
                alt="Generated image"
                className="w-full h-auto"
              />
            </div>

            {/* Prompt Used */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">生成提示词:</p>
              <p className="text-xs text-gray-600 line-clamp-3">{result.prompt}</p>
            </div>

            {/* Product Name if applicable */}
            {productName && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span className="font-semibold">商品:</span>
                <span>{productName}</span>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {result.status === 'failed' && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-medium">生成失败</p>
            {result.error && (
              <p className="text-xs text-red-500 mt-1">{result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
