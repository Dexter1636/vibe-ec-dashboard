'use client';

import React from 'react';
import { ImageAnalysisResult } from '@/types';
import { Tag, CopyButton } from '@/components/ui';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ImageAnalysisResultCardProps {
  result: ImageAnalysisResult;
  productName: string;
}

export const ImageAnalysisResultCard: React.FC<ImageAnalysisResultCardProps> = ({
  result,
  productName,
}) => {
  if (result.status === 'analyzing') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
          <div>
            <p className="text-sm font-semibold text-blue-900">AI 正在分析图片...</p>
            <p className="text-xs text-blue-600">Qwen3-VL 视觉模型正在提取特征</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'failed') {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-start space-x-2">
          <span className="text-red-500 text-xl">❌</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">分析失败</p>
            <p className="text-xs text-red-600 mt-1">{result.error || '未知错误'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={result.imageUrl}
          alt={`${productName} - 图片 ${result.imageIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Selling Points */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          视觉卖点
        </h4>
        <ul className="space-y-1">
          {result.sellingPoints.map((point, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="text-violet-500 mr-2">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Keywords */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <span className="mr-2">🏷️</span>
          关键词
        </h4>
        <div className="flex flex-wrap gap-1">
          {result.keywords.map((keyword, index) => (
            <Tag key={index} size="sm" variant="primary">
              {keyword}
            </Tag>
          ))}
        </div>
      </div>

      {/* Visual Features */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <span className="mr-2">🎨</span>
          视觉特征
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">颜色：</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.visualFeatures.colors.map((color, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {color}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-500">风格：</span>
            <span className="ml-1 font-medium">{result.visualFeatures.style}</span>
          </div>
          {result.visualFeatures.scene && (
            <div className="col-span-2">
              <span className="text-gray-500">场景：</span>
              <span className="ml-1 font-medium">{result.visualFeatures.scene}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-400">
          分析时间：{format(result.analyzedAt!, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
        </span>
        <CopyButton
          text={JSON.stringify(
            {
              sellingPoints: result.sellingPoints,
              keywords: result.keywords,
              visualFeatures: result.visualFeatures,
            },
            null,
            2
          )}
          size="sm"
        />
      </div>
    </div>
  );
};
