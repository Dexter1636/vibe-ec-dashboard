/**
 * Qwen3-VL API Client
 * Uses OpenAI SDK for compatibility with ModelScope API
 */

import OpenAI from 'openai';

/**
 * Lazy initialization to avoid Turbopack caching issues
 * Never initialize at module level
 */
function getClient() {
  return new OpenAI({
    baseURL: process.env.QWEN_BASE_URL || 'https://api-inference.modelscope.cn/v1',
    apiKey: process.env.QWEN_API_KEY,
  });
}

/**
 * Analyze image using Qwen3-VL model
 * Non-streaming approach - image analysis is typically fast (<5 seconds)
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string
): Promise<string> {
  const client = getClient();

  // Log configuration for debugging (don't log the actual API key)
  console.log('Qwen Client Config:', {
    baseURL: process.env.QWEN_BASE_URL || 'https://api-inference.modelscope.cn/v1',
    model: process.env.QWEN_MODEL || 'Qwen/Qwen3-VL-235B-A22B-Instruct',
    hasApiKey: !!process.env.QWEN_API_KEY,
    imageLength: base64Image.length,
  });

  try {
    const response = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || 'Qwen/Qwen3-VL-235B-A22B-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('Qwen API Error:', {
        name: error.name,
        message: error.message,
      });

      // Check for common error types
      if (error.message.includes('fetch')) {
        throw new Error('Failed to connect to Qwen API. Please check your network connection and API configuration.');
      }
      if (error.message.includes('401') || error.message.includes('authentication')) {
        throw new Error('Qwen API authentication failed. Please check your QWEN_API_KEY.');
      }
      if (error.message.includes('404') || error.message.includes('model')) {
        throw new Error('Qwen model not found. Please check your QWEN_MODEL configuration.');
      }

      throw error;
    }
    throw new Error('Unknown error occurred while calling Qwen API');
  }
}
