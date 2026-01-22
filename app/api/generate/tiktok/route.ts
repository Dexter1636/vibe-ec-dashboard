// 抖音文案流式生成 API

import { NextRequest } from 'next/server';
import { generateTiktokCopyStream } from '@/lib/tiktokGenerator';
import { Product, TikTokCopyOptions } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

interface GenerateRequest {
  product: Product;
  options: TikTokCopyOptions;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { product, options } = body;

    // Validate request
    if (!product) {
      return new Response(
        JSON.stringify({ type: 'error', error: 'No product provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!options || !options.styleId) {
      return new Response(
        JSON.stringify({ type: 'error', error: 'No style selected' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send start event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'start', productId: product.id })}\n\n`
            )
          );

          await generateTiktokCopyStream(
            product,
            options,
            {
              onChunk: (chunk) => {
                // Send streaming text for visual feedback (this is temporary display)
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'streaming', text: chunk })}\n\n`
                  )
                );
              },
              onComplete: (result) => {
                // Send final parsed result with all fields
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'complete',
                      result: {
                        id: result.id,
                        productId: result.productId,
                        styleId: result.styleId,
                        hook: result.hook,
                        content: result.content,
                        cta: result.cta,
                        hashtags: result.hashtags,
                        status: result.status,
                        generatedAt: result.generatedAt,
                      }
                    })}\n\n`
                  )
                );
                controller.close();
              },
              onError: (error) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`
                  )
                );
                controller.close();
              },
            }
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Generation failed',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
