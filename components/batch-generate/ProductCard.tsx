'use client';

import React from 'react';
import { Product } from '@/types';
import { Button, Tag } from '@/components/ui';
import { ImageAnalysisButton } from '@/components/image-analysis';
import { format } from 'date-fns';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onAnalyzeImage?: (productId: string, imageIndex: number) => void;
  analyzingImage?: { productId: string; imageIndex: number } | null;
  hasAnalysisResult?: (productId: string, imageIndex: number) => boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onAnalyzeImage,
  analyzingImage,
  hasAnalysisResult,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* 图片预览 */}
      <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* AI图片分析按钮 */}
      {product.images.length > 0 && onAnalyzeImage && (
        <div className="mb-3">
          <ImageAnalysisButton
            productId={product.id}
            imageIndex={0}
            isAnalyzing={
              analyzingImage?.productId === product.id && analyzingImage?.imageIndex === 0
            }
            hasResult={hasAnalysisResult?.(product.id, 0) || false}
            onAnalyze={() => onAnalyzeImage(product.id, 0)}
          />
        </div>
      )}

      {/* 商品信息 */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 line-clamp-1">{product.name}</h4>

        <div className="flex flex-wrap gap-1">
          <Tag size="sm" variant="primary">{product.category}</Tag>
          <Tag size="sm" variant="default">{product.brand}</Tag>
          {product.material && (
            <Tag size="sm" variant="default">{product.material}</Tag>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-0.5">
          {product.color && <div>颜色: {product.color}</div>}
          {product.size && <div>尺寸: {product.size}</div>}
          {product.targetAudience && <div>适用: {product.targetAudience}</div>}
        </div>

        {/* 参考素材 */}
        {(product.referenceImages && product.referenceImages.length > 0) ||
         (product.referenceLinks && product.referenceLinks.length > 0) ? (
          <div className="text-xs text-blue-600">
            {product.referenceImages && product.referenceImages.length > 0 && (
              <span>📎 {product.referenceImages.length} 张参考图 </span>
            )}
            {product.referenceLinks && product.referenceLinks.length > 0 && (
              <span>🔗 {product.referenceLinks.length} 个参考链接</span>
            )}
          </div>
        ) : null}

        {/* 保存到素材库标记 */}
        {product.saveToLibrary && (
          <div className="mt-1">
            <Tag size="sm" variant="success">★ 已保存到素材库</Tag>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-2 mt-4">
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            编辑
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            className="flex-1"
            onClick={() => onDelete(product.id)}
          >
            删除
          </Button>
        )}
      </div>
    </div>
  );
};
