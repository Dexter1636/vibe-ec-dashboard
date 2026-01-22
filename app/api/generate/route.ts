// DeepSeek 通用生成 API（替换现有的 mock 生成）

import { NextRequest, NextResponse } from 'next/server';
import { generateBatchContent } from '@/lib/deepseekGenerator';
import { Product } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

interface GenerateRequest {
  products: Product[];
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { products } = body;

    // Validate request
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    // Generate content for all products
    const results = await generateBatchContent(products);

    // Convert Map to object for JSON serialization
    const resultsObj = Object.fromEntries(results);

    return NextResponse.json({
      success: true,
      results: resultsObj,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}
