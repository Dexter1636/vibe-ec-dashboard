// 抖音文案生成器

import { Product, TikTokCopy, TikTokCopyOptions } from '@/types';
import { generateStream } from './deepseek/client';
import { buildTiktokPrompt, buildTiktokSystemPrompt, parseTiktokResponse } from './deepseek/prompts';

// 生成单条抖音文案（带流式回调）
export async function generateTiktokCopyStream(
  product: Product,
  options: TikTokCopyOptions,
  callbacks: {
    onChunk: (chunk: string) => void;
    onComplete: (copy: TikTokCopy) => void;
    onError: (error: Error) => void;
  }
): Promise<void> {
  const { styleId, targetLength, includeHashtags } = options;

  try {
    const messages = [
      { role: 'system' as const, content: buildTiktokSystemPrompt() },
      {
        role: 'user' as const,
        content: buildTiktokPrompt(product, styleId, targetLength, includeHashtags),
      },
    ];

    let fullContent = '';
    await generateStream(messages, (chunk) => {
      fullContent += chunk;
      callbacks.onChunk(chunk);
    });

    const parsed = parseTiktokResponse(fullContent);

    const copy: TikTokCopy = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      styleId,
      hook: parsed.hook,
      content: parsed.content,
      cta: parsed.cta,
      hashtags: parsed.hashtags,
      status: 'completed',
      generatedAt: new Date(),
    };

    callbacks.onComplete(copy);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error('生成失败'));
  }
}

// 生成单条抖音文案（不带流式回调，直接返回结果）
export async function generateTiktokCopy(
  product: Product,
  options: TikTokCopyOptions
): Promise<TikTokCopy> {
  return new Promise((resolve, reject) => {
    generateTiktokCopyStream(
      product,
      options,
      {
        onChunk: () => {}, // 忽略流式更新
        onComplete: resolve,
        onError: reject,
      }
    );
  });
}
