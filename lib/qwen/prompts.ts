/**
 * Prompt templates and parsers for Qwen3-VL image analysis
 */

import { Product } from '@/types';

export function buildImageAnalysisPrompt(product?: Partial<Product>): string {
  const productContext = product
    ? `【商品上下文信息】
- 商品名称：${product.name || '未知'}
- 品牌：${product.brand || '未知'}
- 类目：${product.category || '未知'}
- 材质：${product.material || '未指定'}
- 颜色：${product.color || '未指定'}
- 适用人群：${product.targetAudience || '通用'}

`
    : '';

  return `你是专业的电商图片分析专家。请仔细观察这张商品图片，提取视觉信息。

${productContext}
【分析任务】
1. **视觉卖点** (3-5条): 从图片中识别出的吸引人的视觉特点
   - 例如：材质质感、设计细节、工艺特点、功能展示等
   - 要具体描述图片中看到的内容，不要凭空想象

2. **关键词** (5-10个): 描述图片的标签和关键词
   - 包括：风格、场景、功能、材质、颜色等维度
   - 单个词或2-3字的短语

3. **视觉特征**:
   - **颜色**: 图片中主要颜色（2-4个，用中文描述，如"深棕色"、"米白色"）
   - **风格**: 整体视觉风格（如：简约时尚、奢华典雅、休闲运动、复古怀旧等）
   - **场景** (可选): 如果图片有明确的场景背景（如办公室、户外、室内等）

【要求】
- 仅基于图片中的视觉信息进行分析
- 如果商品上下文信息与图片不符，以图片为准
- 卖点要具体、真实，避免夸大其词
- 关键词要准确、专业，便于搜索和分类

请以JSON格式返回：
{
  "sellingPoints": ["卖点1", "卖点2", "卖点3"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "visualFeatures": {
    "colors": ["颜色1", "颜色2"],
    "style": "风格描述",
    "scene": "场景描述（可选）"
  }
}`;
}

export function parseImageAnalysisResponse(response: string): {
  sellingPoints: string[];
  keywords: string[];
  visualFeatures: {
    colors: string[];
    style: string;
    scene?: string;
  };
} {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse image analysis response:', error);
    // Fallback to empty structure
    return {
      sellingPoints: [],
      keywords: [],
      visualFeatures: {
        colors: [],
        style: '未知',
      },
    };
  }
}
