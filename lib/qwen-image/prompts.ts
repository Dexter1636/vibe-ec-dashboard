/**
 * Qwen-Image Prompt Templates
 * Converts product data and style preferences into detailed image generation prompts
 */

import { Product } from '@/types';
import { ImageStyleId, ImageScenario, IMAGE_STYLES } from '@/types';

/**
 * Build prompt from product data and selected style
 */
export function buildImagePrompt(
  product: Product,
  styleId: ImageStyleId
): string {
  const style = IMAGE_STYLES.find((s) => s.id === styleId);
  if (!style) {
    throw new Error(`Invalid style ID: ${styleId}`);
  }

  const scenario = style.scenario;
  const basePrompt = getScenarioPrompt(scenario);
  const styleModifiers = getStyleModifiers(styleId);
  const productDescription = buildProductDescription(product);

  return `${basePrompt}, ${productDescription}, ${styleModifiers}`.trim();
}

/**
 * Get base prompt for scenario
 */
function getScenarioPrompt(scenario: ImageScenario): string {
  const scenarios = {
    'poster': 'Professional e-commerce promotional poster, high quality, 4K, commercial photography',
    'product-cover': 'Product cover image for e-commerce platform, clean background, professional lighting, product photography',
    'social': 'Social media marketing image, lifestyle photography, aesthetic composition, Instagram style',
  };
  return scenarios[scenario];
}

/**
 * Get style-specific modifiers
 */
function getStyleModifiers(styleId: ImageStyleId): string {
  const modifiers: Record<ImageStyleId, string> = {
    'poster': 'bold typography, sale tag, price emphasis, promotional elements, vibrant colors',
    'product-cover': 'white background, studio lighting, sharp focus, high contrast, professional product photography',
    'lifestyle': 'natural lighting, candid moment, lifestyle context, warm tones, authentic feel',
    'minimalist': 'clean composition, negative space, simple colors, modern aesthetic, Scandinavian style',
    'luxury': 'elegant lighting, gold accents, premium materials, sophisticated atmosphere, luxury brand style',
    'vibrant': 'saturated colors, dynamic composition, energetic feel, bold contrasts, eye-catching',
    'seasonal': 'seasonal decorations, thematic elements, holiday atmosphere, relevant props',
    'brand-story': 'editorial style, brand aesthetic, premium quality, sophisticated mood, brand identity',
  };
  return modifiers[styleId];
}

/**
 * Build product description from product data
 */
function buildProductDescription(product: Product): string {
  let desc = `${product.name}, ${product.brand} brand, ${product.category}`;

  if (product.material) {
    desc += `, made of ${product.material}`;
  }
  if (product.color) {
    desc += `, ${product.color} color`;
  }
  if (product.targetAudience) {
    desc += `, designed for ${product.targetAudience}`;
  }

  return desc;
}

/**
 * Validate manual prompt
 */
export function validateManualPrompt(
  prompt: string
): { valid: boolean; error?: string } {
  const trimmed = prompt.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: 'Prompt must be at least 10 characters' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Prompt must be less than 1000 characters' };
  }

  return { valid: true };
}
