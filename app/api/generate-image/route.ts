/**
 * Image Generation API Route
 * Implements server-side polling for Qwen-Image async generation
 *
 * Timeout: 120 seconds (maxDuration)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/qwen-image/client';
import { buildImagePrompt, validateManualPrompt } from '@/lib/qwen-image/prompts';
import { Product, ImageGenerationOptions, GeneratedImage } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes - maximum for Next.js serverless

interface GenerateImageRequest {
  options: ImageGenerationOptions;
  product?: Product; // Required if inputMode is 'product'
}

export async function POST(request: NextRequest) {
  try {
    // Environment check
    if (!process.env.QWEN_API_KEY) {
      return NextResponse.json(
        { error: 'QWEN_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body: GenerateImageRequest = await request.json();
    const { options, product } = body;

    // Validate options
    if (!options || !options.styleId) {
      return NextResponse.json(
        { error: 'Style ID is required' },
        { status: 400 }
      );
    }

    // Build prompt based on input mode
    let prompt: string;
    let productId: string | null = null;

    if (options.inputMode === 'product') {
      if (!product) {
        return NextResponse.json(
          { error: 'Product data required for product mode' },
          { status: 400 }
        );
      }
      productId = product.id;
      prompt = buildImagePrompt(product, options.styleId);
    } else {
      if (!options.manualPrompt) {
        return NextResponse.json(
          { error: 'Manual prompt required for manual mode' },
          { status: 400 }
        );
      }

      const validation = validateManualPrompt(options.manualPrompt);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      productId = null;
      prompt = options.manualPrompt;
    }

    // Generate image with server-side polling
    console.log('Starting image generation:', { prompt: prompt.substring(0, 100) });
    const startTime = Date.now();

    const imageUrl = await generateImage(prompt, {
      maxAttempts: 24, // 2 minutes at 5s intervals
      intervalMs: 5000,
      onProgress: (attempt, status) => {
        console.log(`Polling attempt ${attempt}: ${status}`);
      },
    });

    const generationTime = (Date.now() - startTime) / 1000;
    console.log(`Image generation completed in ${generationTime}s`);

    // Build result
    const result: GeneratedImage = {
      id: `img-${Date.now()}`,
      productId,
      styleId: options.styleId,
      prompt,
      imageUrl,
      status: 'completed',
      generatedAt: new Date(),
      generationTime,
    };

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('Image generation error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Image generation failed';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
