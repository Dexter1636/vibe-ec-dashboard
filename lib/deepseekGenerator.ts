// DeepSeek 生成器 - 替换 mockGenerator

import { Product, GeneratedContent } from '@/types';
import { generateStream } from './deepseek/client';
import { buildProductPrompt, parseProductResponse } from './deepseek/prompts';

// 单个商品生成
export async function generateContent(product: Product): Promise<GeneratedContent> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content:
          '你是专业的电商文案创作专家。请根据商品信息生成吸引人的标题和卖点。',
      },
      {
        role: 'user' as const,
        content: buildProductPrompt(product),
      },
    ];

    const response = await generateStream(messages, () => {});
    const parsed = parseProductResponse(response);

    return {
      productId: product.id,
      mainImage: {
        originalImage: product.images[0],
        generatedImage: product.images[0],
        textOverlay: parsed.title,
      },
      title: parsed.title,
      sellingPoints: parsed.sellingPoints,
      status: 'completed',
      generatedAt: new Date(),
    };
  } catch (error) {
    return {
      productId: product.id,
      mainImage: {
        originalImage: product.images[0],
        generatedImage: product.images[0],
      },
      title: '',
      sellingPoints: [],
      status: 'failed',
      error: error instanceof Error ? error.message : '生成失败',
    };
  }
}

// 批量生成
export async function generateBatchContent(
  products: Product[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, GeneratedContent>> {
  const results = new Map<string, GeneratedContent>();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const result = await generateContent(product);
      results.set(product.id, result);
      onProgress?.(i + 1, products.length);
    } catch (error) {
      results.set(product.id, {
        productId: product.id,
        mainImage: {
          originalImage: product.images[0],
          generatedImage: product.images[0],
        },
        title: '',
        sellingPoints: [],
        status: 'failed',
        error: error instanceof Error ? error.message : '生成失败',
      });
    }
  }

  return results;
}

// 基于模板生成（保留兼容性）
export async function generateFromTemplate(
  product: Product,
  template: any
): Promise<GeneratedContent> {
  // 如果模板有内容，使用模板；否则调用AI生成
  if (template?.content?.titleTemplate || template?.content?.sellingPointsTemplate) {
    let title = '';
    let sellingPoints: string[] = [];

    if (template.content.titleTemplate) {
      title = template.content.titleTemplate
        .replace('{brand}', product.brand)
        .replace('{name}', product.name)
        .replace('{category}', product.category)
        .replace('{material}', product.material || '')
        .replace('{color}', product.color || '')
        .replace('{targetAudience}', product.targetAudience || '');
    }

    if (template.content.sellingPointsTemplate) {
      sellingPoints = template.content.sellingPointsTemplate.map((point: string) =>
        point
          .replace('{brand}', product.brand)
          .replace('{material}', product.material || '精选材料')
          .replace('{targetAudience}', product.targetAudience || '多场景')
      );
    }

    return {
      productId: product.id,
      mainImage: {
        originalImage: product.images[0],
        generatedImage: product.images[0],
        textOverlay: title,
      },
      title,
      sellingPoints,
      status: 'completed',
      generatedAt: new Date(),
    };
  }

  // 没有模板内容，调用AI生成
  return generateContent(product);
}
