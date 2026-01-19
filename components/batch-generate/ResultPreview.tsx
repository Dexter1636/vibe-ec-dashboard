'use client';

import React from 'react';
import { Product, GeneratedContent } from '@/types';
import { ResultCard } from './ResultCard';
import { Button } from '@/components/ui';

interface ResultPreviewProps {
  products: Product[];
  results: Map<string, GeneratedContent>;
  onRegenerate?: (productId: string) => void;
  onSaveTemplate?: (productId: string) => void;
  onExport?: (productId: string) => void;
  onExportAll?: () => void;
  onEdit?: (productId: string, data: { title: string; sellingPoints: string[] }) => void;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({
  products,
  results,
  onRegenerate,
  onSaveTemplate,
  onExport,
  onExportAll,
  onEdit,
}) => {
  const completedCount = Array.from(results.values()).filter(
    r => r.status === 'completed'
  ).length;

  const totalCount = products.length;
  const hasCompleted = totalCount > 0 && completedCount > 0;

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          生成结果 {totalCount > 0 && `(${completedCount}/${totalCount})`}
        </h3>
        {hasCompleted && onExportAll && (
          <Button size="sm" variant="outline" onClick={onExportAll}>
            导出全部
          </Button>
        )}
      </div>

      {/* 结果列表 */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">暂无生成结果</p>
          <p className="text-gray-400 text-xs mt-1">请先添加商品并点击生成</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(product => {
            const result = results.get(product.id);
            return (
              <ResultCard
                key={product.id}
                product={product}
                result={
                  result || {
                    productId: product.id,
                    mainImage: {
                      originalImage: product.images[0] || '',
                      generatedImage: '',
                    },
                    title: '',
                    sellingPoints: [],
                    status: 'pending',
                  }
                }
                onRegenerate={onRegenerate}
                onSaveTemplate={onSaveTemplate}
                onExport={onExport}
                onEdit={onEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
