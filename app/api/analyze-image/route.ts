import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductImage } from '@/lib/imageAnalysisGenerator';
import { Product } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout for image analysis

interface AnalyzeImageRequest {
  product: Product;
  imageIndex: number;
  base64Image: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.QWEN_API_KEY) {
      console.error('QWEN_API_KEY is not set');
      return NextResponse.json(
        { error: 'Qwen API key is not configured. Please add QWEN_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const body: AnalyzeImageRequest = await request.json();
    const { product, imageIndex, base64Image } = body;

    // Validate request
    if (!product) {
      return NextResponse.json(
        { error: 'No product provided' },
        { status: 400 }
      );
    }

    if (!product.images || !product.images[imageIndex]) {
      return NextResponse.json(
        { error: `Image at index ${imageIndex} not found` },
        { status: 400 }
      );
    }

    if (!base64Image) {
      return NextResponse.json(
        { error: 'Base64 image data is required' },
        { status: 400 }
      );
    }

    // Analyze image
    const result = await analyzeProductImage(product, imageIndex, base64Image);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Image analysis error:', error);

    // Provide more detailed error information
    let errorMessage = 'Image analysis failed';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Log the full error for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
