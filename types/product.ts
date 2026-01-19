// 商品相关类型定义

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  material?: string;
  size?: string;
  color?: string;
  targetAudience?: string;
  images: string[];           // 商品图片URL
  referenceImages?: string[]; // 参考图URL
  referenceLinks?: string[];  // 参考链接
  saveToLibrary?: boolean;    // 是否保存到素材库
  createdAt: Date;
}

export interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  material?: string;
  size?: string;
  color?: string;
  targetAudience?: string;
  images: File[];
  referenceImages?: File[];
  referenceLinks?: string[];
  saveToLibrary?: boolean;
}

export const CATEGORIES = [
  '男包',
  '女包',
  '配饰',
  '鞋靴',
  '服装',
  '其他',
] as const;

export const TARGET_AUDIENCES = [
  '商务人士',
  '学生',
  '运动爱好者',
  '旅行者',
  '时尚潮人',
  '通用',
] as const;
