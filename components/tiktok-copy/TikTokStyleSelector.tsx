'use client';

import React from 'react';
import { TikTokStyleId, TIKTOK_STYLES, TikTokCopyOptions } from '@/types';

interface TikTokStyleSelectorProps {
  options: TikTokCopyOptions;
  onChange: (options: TikTokCopyOptions) => void;
  disabled?: boolean;
}

export const TikTokStyleSelector: React.FC<TikTokStyleSelectorProps> = ({
  options,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      {/* Style Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            选择文案风格 <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TIKTOK_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...options, styleId: style.id })}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${options.styleId === style.id
                  ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                  : 'border-gray-200 hover:border-violet-300 bg-white'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              `}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-2xl">{style.icon}</span>
                <span className="text-sm font-semibold text-gray-900">{style.name}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            文案长度
          </label>
          <select
            value={options.targetLength}
            onChange={(e) => {
              const value = e.target.value as 'short' | 'medium' | 'long';
              onChange({ ...options, targetLength: value });
            }}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
          >
            <option value="short">短文案 (50-100字)</option>
            <option value="medium">中等 (100-200字)</option>
            <option value="long">长文案 (200-300字)</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeHashtags}
              onChange={(e) => onChange({ ...options, includeHashtags: e.target.checked })}
              disabled={disabled}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">生成话题标签（#标签）</span>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
        <p className="text-sm text-violet-900">
          已选择风格：
          <span className="font-bold ml-1">
            {TIKTOK_STYLES.find((s) => s.id === options.styleId)?.name || '未选择'}
          </span>
        </p>
      </div>
    </div>
  );
};
