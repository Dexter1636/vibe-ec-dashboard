// 模板相关类型定义

export type TemplateType = 'complete' | 'title-only' | 'selling-points-only' | 'image-only';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  tags: string[];
  category?: string;
  content: {
    mainImageTemplate?: {
      textOverlay: string;
      style: string;
    };
    titleTemplate?: string;
    sellingPointsTemplate?: string[];
  };
  createdAt: Date;
  usedCount?: number;
}

export interface SaveToTemplateOptions {
  includeMainImage?: boolean;
  includeTitle?: boolean;
  includeSellingPoints?: boolean;
  templateName?: string;
  tags?: string[];
}
