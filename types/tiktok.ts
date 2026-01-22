// 抖音/短视频文案相关类型定义

import { Product } from './product';

// 抖音文案风格定义
export const TIKTOK_STYLES = [
  {
    id: 'funny',
    name: '搞笑幽默',
    icon: '😄',
    description: '用幽默诙谐的方式介绍产品，增加娱乐性和传播力',
  },
  {
    id: 'practical',
    name: '实用干货',
    icon: '💡',
    description: '突出产品功能和使用场景，强调实用价值',
  },
  {
    id: 'emotional',
    name: '情感共鸣',
    icon: '❤️',
    description: '通过情感故事和用户痛点引发共鸣',
  },
  {
    id: 'recommendation',
    name: '种草安利',
    icon: '🌟',
    description: '真诚推荐，像朋友分享一样自然',
  },
  {
    id: 'story',
    name: '故事讲述',
    icon: '📖',
    description: '通过故事情节展示产品价值',
  },
  {
    id: 'comparison',
    name: '对比测评',
    icon: '⚔️',
    description: '与市面产品对比，突出优势',
  },
] as const;

export type TikTokStyleId = (typeof TIKTOK_STYLES)[number]['id'];

// 单条抖音文案
export interface TikTokCopy {
  id: string;
  productId: string;
  styleId: TikTokStyleId;
  hook: string; // 黄金3秒开头
  content: string; // 主体内容
  cta: string; // 行动号召
  hashtags: string[]; // 话题标签
  status: 'pending' | 'streaming' | 'completed' | 'failed';
  streamedContent?: string; // 流式显示的累积内容
  error?: string;
  generatedAt: Date;
}

// 生成选项
export interface TikTokCopyOptions {
  styleId: TikTokStyleId;
  targetLength: 'short' | 'medium' | 'long';
  includeHashtags: boolean;
}

// 批量生成状态
export interface TikTokBatchState {
  isGenerating: boolean;
  currentProductIndex: number;
  totalProducts: number;
  results: Map<string, TikTokCopy>;
}
