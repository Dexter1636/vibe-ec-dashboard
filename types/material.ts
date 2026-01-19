// 素材相关类型定义

import { Product } from './product';

export interface Material extends Product {
  usedCount?: number;
  lastUsedAt?: Date;
}

export interface MaterialFilters {
  category?: string;
  brand?: string;
  searchTerm?: string;
}
