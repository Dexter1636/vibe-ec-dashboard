/**
 * Image Analysis Generator
 * Analyzes product images using Qwen3-VL to extract selling points and keywords
 */

import { Product, ImageAnalysisResult } from '@/types';
import { analyzeImage } from './qwen/client';
import { buildImageAnalysisPrompt, parseImageAnalysisResponse } from './qwen/prompts';

/**
 * Analyze a single product image
 * @param product - The product to analyze
 * @param imageIndex - Index of the image in the product's images array
 * @param base64Image - Base64-encoded image data (must be pre-converted on client side)
 * @param callbacks - Optional progress callbacks
 */
export async function analyzeProductImage(
  product: Product,
  imageIndex: number,
  base64Image: string,
  callbacks?: {
    onProgress?: (status: string) => void;
  }
): Promise<ImageAnalysisResult> {
  const imageUrl = product.images[imageIndex];

  if (!imageUrl) {
    throw new Error(`Image at index ${imageIndex} not found`);
  }

  if (!base64Image) {
    throw new Error('Base64 image data is required');
  }

  try {
    callbacks?.onProgress?.('Sending to AI model...');
    const prompt = buildImageAnalysisPrompt(product);

    callbacks?.onProgress?.('Analyzing image...');
    const response = await analyzeImage(base64Image, prompt);

    callbacks?.onProgress?.('Parsing results...');
    const parsed = parseImageAnalysisResponse(response);

    const result: ImageAnalysisResult = {
      id: `${product.id}-${imageIndex}-${Date.now()}`,
      productId: product.id,
      imageIndex,
      imageUrl,
      sellingPoints: parsed.sellingPoints,
      keywords: parsed.keywords,
      visualFeatures: parsed.visualFeatures,
      status: 'completed',
      analyzedAt: new Date(),
    };

    return result;
  } catch (error) {
    throw new Error(
      `Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
