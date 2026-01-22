'use client';

import React from 'react';
import { Textarea } from '@/components/ui';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  disabled,
  error,
}) => {
  const placeholder = `请详细描述您想要的图片内容，例如：
- 产品外观和特点
- 背景场景
- 风格和氛围
- 色彩偏好
- 任何其他细节

示例：一个时尚的手提包，放置在白色背景上，专业的摄影灯光，简约风格，高端质感`;

  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={8}
        error={error}
        label="图片描述"
      />
      <div className="flex justify-between mt-2">
        <p className="text-xs text-gray-500">
          字数: {value.length} / 1000
        </p>
        {value.length > 0 && value.length < 10 && (
          <p className="text-xs text-orange-600">
            至少需要 10 个字符
          </p>
        )}
      </div>
    </div>
  );
};
