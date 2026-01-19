// 生成结果相关类型定义

export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface GeneratedContent {
  productId: string;
  mainImage: {
    originalImage: string;
    generatedImage: string;    // 模拟生成的图（原图+文字叠加）
    textOverlay?: string;      // 文字内容
  };
  title: string;
  sellingPoints: string[];
  status: GenerationStatus;
  generatedAt?: Date;
  error?: string;
}

export interface EditableResult {
  productId: string;
  title: string;
  sellingPoints: string[];
}
