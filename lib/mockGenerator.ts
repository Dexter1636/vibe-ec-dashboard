// 模拟生成逻辑

import { Product, GeneratedContent } from '@/types';
import { format } from 'date-fns';

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟生成标题
function generateMockTitle(product: Product): string {
  const templates = [
    `${product.brand} ${product.name} ${product.material || ''} ${product.targetAudience || ''}专用`,
    `2024新款${product.name} ${product.material || ''}${product.category}`,
    `${product.category} ${product.name} ${product.brand}官方正品`,
    `${product.name} ${product.material || ''}${product.color ? ' ' + product.color : ''} ${product.targetAudience || ''}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// 模拟生成卖点
function generateMockSellingPoints(product: Product): string[] {
  const points = [
    `${product.material || '精选材料'}材质，品质有保障`,
    `${product.brand}品牌正品，品质信赖`,
    `适合${product.targetAudience || '多场景'}使用`,
    `工艺精良，细节考究`,
    `${product.size || '标准尺寸'}，实用便携`,
    `${product.color ? product.color + '配色' : '经典配色'}，时尚大方`,
    `多层设计，大容量收纳`,
    `耐磨耐用，使用寿命长`,
  ];
  // 随机返回1-2条
  return points.sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 2));
}

// 模拟生成主图（使用Canvas添加文字叠加）
function addMockTextOverlay(imageUrl: string, title: string): string {
  // 在实际应用中，这里应该使用Canvas API或后端服务来生成带文字的图片
  // 这里简单返回原图URL，实际展示时用CSS叠加文字
  return imageUrl;
}

// 主生成函数
export async function generateContent(
  product: Product
): Promise<GeneratedContent> {
  // 模拟API延迟 1.5-2.5秒
  await delay(1500 + Math.random() * 1000);

  // 模拟生成标题
  const title = generateMockTitle(product);

  // 模拟生成卖点
  const sellingPoints = generateMockSellingPoints(product);

  // 模拟生成主图（原图+文字叠加）
  const generatedImage = addMockTextOverlay(product.images[0], title);

  return {
    productId: product.id,
    mainImage: {
      originalImage: product.images[0],
      generatedImage,
      textOverlay: title,
    },
    title,
    sellingPoints,
    status: 'completed',
    generatedAt: new Date(),
  };
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

// 基于模板生成
export async function generateFromTemplate(
  product: Product,
  template: any // TODO: 使用Template类型
): Promise<GeneratedContent> {
  await delay(1500 + Math.random() * 1000);

  let title = '';
  let sellingPoints: string[] = [];

  // 如果模板有标题结构
  if (template.content.titleTemplate) {
    title = template.content.titleTemplate
      .replace('{brand}', product.brand)
      .replace('{name}', product.name)
      .replace('{category}', product.category)
      .replace('{material}', product.material || '')
      .replace('{color}', product.color || '')
      .replace('{targetAudience}', product.targetAudience || '');
  } else {
    title = generateMockTitle(product);
  }

  // 如果模板有卖点结构
  if (template.content.sellingPointsTemplate) {
    sellingPoints = template.content.sellingPointsTemplate.map((point: string) =>
      point
        .replace('{brand}', product.brand)
        .replace('{material}', product.material || '精选材料')
        .replace('{targetAudience}', product.targetAudience || '多场景')
    );
  } else {
    sellingPoints = generateMockSellingPoints(product);
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
