// DeepSeek API 提示词模板

import { Product, TikTokStyleId } from '@/types';

// ===== 商品标题+卖点提示词 =====

export function buildProductPrompt(product: Product): string {
  return `你是专业的电商文案创作专家。请为以下商品生成吸引人的标题和卖点。

【商品信息】
- 商品名称：${product.name}
- 品牌：${product.brand}
- 类目：${product.category}
- 材质：${product.material || '未指定'}
- 颜色：${product.color || '未指定'}
- 尺寸：${product.size || '未指定'}
- 适用人群：${product.targetAudience || '通用'}

【要求】
1. 标题要吸引眼球，突出核心卖点
2. 卖点要具体、有说服力，3-5条
3. 语言简洁有力，符合电商风格

请以JSON格式返回：
{
  "title": "吸引人的商品标题",
  "sellingPoints": ["卖点1", "卖点2", "卖点3"]
}`;
}

export function parseProductResponse(response: string): {
  title: string;
  sellingPoints: string[];
} {
  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // 降级解析逻辑
    return {
      title: 'AI生成标题',
      sellingPoints: ['精选品质', '值得信赖'],
    };
  }
}

// ===== 抖音文案提示词 =====

export function buildTiktokSystemPrompt(): string {
  return `你是专业的抖音/短视频电商文案创作专家。

【文案结构要求】
1. 黄金3秒开头（Hook）：立即抓住用户注意力
2. 主体内容：根据指定风格展开
3. 行动号召（CTA）：引导用户点赞、评论、购买
4. 话题标签：3-5个相关标签

【创作原则】
- 口语化、接地气，避免书面语
- 多用短句，节奏感强
- 适当使用emoji增强表达
- 制造紧迫感和稀缺感
- 突出产品独特卖点
- 考虑目标受众的语言习惯

【输出格式】请严格按照以下JSON格式输出：
{
  "hook": "黄金3秒开头，立即抓住注意力",
  "content": "主体内容，根据风格展开",
  "cta": "行动号召，引导购买",
  "hashtags": ["标签1", "标签2", "标签3"]
}`;
}

// 抖音风格提示词
const STYLE_PROMPTS: Record<TikTokStyleId, string> = {
  funny: `【风格要求：搞笑幽默】
- 使用幽默、诙谐、夸张的语言
- 适当使用网络热梗和流行语
- 制造反差萌和意外感
- 用轻松的方式展示产品价值
- 语气：活泼、俏皮、接地气`,

  practical: `【风格要求：实用干货】
- 直接点明产品功能和使用场景
- 列举具体的使用方法和技巧
- 强调解决问题的能力
- 用数据和事实说话
- 语气：专业、真诚、实用`,

  emotional: `【风格要求：情感共鸣】
- 从用户痛点和情感需求切入
- 讲述温暖、感人的故事
- 强调产品带来的情感价值
- 激发用户共鸣和认同
- 语气：温暖、走心、感性`,

  recommendation: `【风格要求：种草安利】
- 像朋友一样真诚推荐
- 分享真实使用体验
- 强调"必入"、"不买亏"的感觉
- 用第一人称叙述更自然
- 语气：热情、真诚、种草感强`,

  story: `【风格要求：故事讲述】
- 用完整的故事线展示产品
- 设置情节转折和高潮
- 通过故事自然植入产品
- 制造悬念和吸引力
- 语气：生动、有趣、代入感强`,

  comparison: `【风格要求：对比测评】
- 与市面同类产品对比
- 突出本产品的独特优势
- 客观指出其他产品不足
- 强调性价比和购买理由
- 语气：客观、专业、有说服力`,
};

const LENGTH_INSTRUCTIONS = {
  short: '50-100字',
  medium: '100-200字',
  long: '200-300字',
};

export function buildTiktokPrompt(
  product: Product,
  styleId: TikTokStyleId,
  targetLength: 'short' | 'medium' | 'long',
  includeHashtags: boolean
): string {
  const lengthInstruction = LENGTH_INSTRUCTIONS[targetLength];
  const stylePrompt = STYLE_PROMPTS[styleId];

  let productInfo = `
【商品信息】
- 商品名称：${product.name}
- 品牌：${product.brand}
- 类目：${product.category}
`;

  if (product.material) productInfo += `- 材质：${product.material}\n`;
  if (product.size) productInfo += `- 尺寸：${product.size}\n`;
  if (product.color) productInfo += `- 颜色：${product.color}\n`;
  if (product.targetAudience) productInfo += `- 适用人群：${product.targetAudience}\n`;

  productInfo += `
【目标长度】${lengthInstruction}
${includeHashtags ? '【要求】生成3-5个相关话题标签' : '【要求】不生成标签'}
`;

  return `${stylePrompt}

${productInfo}

请根据以上信息和风格要求，创作一篇抖音/短视频文案。`;
}

export function parseTiktokResponse(response: string): {
  hook: string;
  content: string;
  cta: string;
  hashtags: string[];
} {
  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // 降级解析逻辑
    return {
      hook: '',
      content: response,
      cta: '点击链接购买，限时优惠中！',
      hashtags: [],
    };
  }
}
