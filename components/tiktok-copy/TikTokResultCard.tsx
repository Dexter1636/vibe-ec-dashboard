'use client';

import React from 'react';
import { TikTokCopy, TIKTOK_STYLES } from '@/types';
import { CopyButton } from '@/components/ui/CopyButton';
import { StreamingText } from './StreamingText';
import { format } from 'date-fns';

interface TikTokResultCardProps {
  copy: TikTokCopy;
  productName: string;
}

export const TikTokResultCard: React.FC<TikTokResultCardProps> = ({ copy, productName }) => {
  const style = TIKTOK_STYLES.find((s) => s.id === copy.styleId);

  const getFullText = () => {
    return `${copy.hook}\n\n${copy.content}\n\n${copy.cta}${
      copy.hashtags.length > 0 ? '\n\n' + copy.hashtags.map((h) => `#${h}`).join(' ') : ''
    }`;
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{style?.icon}</span>
            <div>
              <h4 className="text-sm font-bold text-violet-900">{style?.name}</h4>
              <p className="text-xs text-violet-600">
                {format(copy.generatedAt, 'HH:mm:ss')}
              </p>
            </div>
          </div>
          <CopyButton text={getFullText()} size="sm" variant="outline" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Streaming State - Loading */}
        {copy.status === 'streaming' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {/* Loading Spinner */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-violet-900">AI 正在创作中...</p>
              <p className="text-xs text-gray-500">DeepSeek V3.2 正在为您生成文案</p>
              <div className="flex items-center justify-center space-x-1 mt-3">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Completed State - Show Structured Data */}
        {copy.status === 'completed' && (
          <>
            {/* Hook */}
            {copy.hook && (
              <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-xs">🔥</span>
                  <span className="text-xs font-semibold text-orange-700">黄金开头</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">{copy.hook}</p>
              </div>
            )}

            {/* Main Content */}
            <div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {copy.content}
              </p>
            </div>

            {/* CTA */}
            {copy.cta && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-xs">📢</span>
                  <span className="text-xs font-semibold text-blue-700">行动号召</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">{copy.cta}</p>
              </div>
            )}

            {/* Hashtags */}
            {copy.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {copy.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* Error State */}
        {copy.status === 'failed' && copy.error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">{copy.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
