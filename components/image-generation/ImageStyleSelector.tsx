'use client';

import React from 'react';
import { ImageStyleId, IMAGE_STYLES, ImageGenerationOptions } from '@/types';

interface ImageStyleSelectorProps {
  options: ImageGenerationOptions;
  onChange: (options: ImageGenerationOptions) => void;
  disabled?: boolean;
}

export const ImageStyleSelector: React.FC<ImageStyleSelectorProps> = ({
  options,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      {/* Input Mode Selection */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          输入方式
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="inputMode"
              value="product"
              checked={options.inputMode === 'product'}
              onChange={() => onChange({ ...options, inputMode: 'product' })}
              disabled={disabled}
              className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">从商品选择</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="inputMode"
              value="manual"
              checked={options.inputMode === 'manual'}
              onChange={() => onChange({ ...options, inputMode: 'manual' })}
              disabled={disabled}
              className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">自定义描述</span>
          </label>
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          选择图片风格 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMAGE_STYLES.map((style) => (
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
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-3xl">{style.icon}</span>
                <span className="text-xs font-semibold text-gray-900">{style.name}</span>
                <span className="text-xs text-gray-500 line-clamp-2">{style.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
        <p className="text-sm text-violet-900">
          已选择风格：
          <span className="font-bold ml-1">
            {IMAGE_STYLES.find((s) => s.id === options.styleId)?.name || '未选择'}
          </span>
        </p>
      </div>
    </div>
  );
};
