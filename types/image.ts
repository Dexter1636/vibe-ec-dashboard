/**
 * AI Image Generation Types
 * Defines styles, options, and result structures for Qwen-Image API integration
 */

// 8 predefined image styles covering e-commerce scenarios
export const IMAGE_STYLES = [
  {
    id: 'poster',
    name: '电商海报',
    icon: '🛒',
    description: '促销活动海报，突出价格和优惠信息',
    scenario: 'poster' as const,
  },
  {
    id: 'product-cover',
    name: '商品首图',
    icon: '📦',
    description: '抖音/淘宝主图，突出产品特点',
    scenario: 'product-cover' as const,
  },
  {
    id: 'lifestyle',
    name: '生活方式',
    icon: '🌟',
    description: '展示产品使用场景和生活美学',
    scenario: 'social' as const,
  },
  {
    id: 'minimalist',
    name: '简约风格',
    icon: '⬜',
    description: '干净简洁的视觉设计',
    scenario: 'social' as const,
  },
  {
    id: 'luxury',
    name: '高端奢华',
    icon: '💎',
    description: '彰显品质和尊贵感',
    scenario: 'social' as const,
  },
  {
    id: 'vibrant',
    name: '活力鲜艳',
    icon: '🎨',
    description: '色彩鲜明，充满活力',
    scenario: 'social' as const,
  },
  {
    id: 'seasonal',
    name: '季节主题',
    icon: '🍂',
    description: '结合季节元素的营销图',
    scenario: 'poster' as const,
  },
  {
    id: 'brand-story',
    name: '品牌故事',
    icon: '📖',
    description: '讲述品牌理念和价值',
    scenario: 'poster' as const,
  },
] as const;

export type ImageStyleId = (typeof IMAGE_STYLES)[number]['id'];
export type ImageScenario = 'poster' | 'product-cover' | 'social';

/**
 * Generated image result from Qwen-Image API
 */
export interface GeneratedImage {
  id: string;
  productId: string | null; // null if manual prompt mode
  styleId: ImageStyleId;
  prompt: string; // The actual prompt sent to API

  // Output
  imageUrl: string; // Generated image URL from API
  thumbnailUrl?: string; // Optional thumbnail

  // Status tracking
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;

  // Metadata
  generatedAt: Date;
  generationTime?: number; // Time in seconds
}

/**
 * User options for image generation
 */
export interface ImageGenerationOptions {
  styleId: ImageStyleId;
  inputMode: 'product' | 'manual';

  // Product mode
  productId?: string;

  // Manual mode
  manualPrompt?: string;
}
