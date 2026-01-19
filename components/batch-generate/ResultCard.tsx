'use client';

import React, { useState } from 'react';
import { GeneratedContent, Product } from '@/types';
import { Button, Input, Textarea, Tag } from '@/components/ui';
import { format } from 'date-fns';

interface ResultCardProps {
  product: Product;
  result: GeneratedContent;
  onRegenerate?: (productId: string) => void;
  onSaveTemplate?: (productId: string) => void;
  onExport?: (productId: string) => void;
  onEdit?: (productId: string, data: { title: string; sellingPoints: string[] }) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  product,
  result,
  onRegenerate,
  onSaveTemplate,
  onExport,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(result.title);
  const [editedSellingPoints, setEditedSellingPoints] = useState(
    result.sellingPoints.join('\n')
  );

  const handleSaveEdit = () => {
    const points = editedSellingPoints
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    onEdit?.(result.productId, {
      title: editedTitle,
      sellingPoints: points,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(result.title);
    setEditedSellingPoints(result.sellingPoints.join('\n'));
    setIsEditing(false);
  };

  const renderMainImage = () => {
    if (result.status === 'generating') {
      return (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (result.status === 'failed') {
      return (
        <div className="w-full h-48 bg-red-50 rounded-lg flex items-center justify-center">
          <div className="text-red-500 text-sm text-center px-4">
            生成失败<br />
            <span className="text-xs">{result.error}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <img
          src={result.mainImage.originalImage}
          alt={result.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        {/* 模拟文字叠加效果 */}
        {result.mainImage.textOverlay && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black from-60% to-transparent p-4 rounded-b-lg">
            <p className="text-white text-sm font-medium line-clamp-2">
              {result.title}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 主图预览 */}
      <div className="p-4 pb-0">
        {renderMainImage()}
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-4">
        {/* 标题 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">标题</label>
            {result.status === 'completed' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                编辑
              </button>
            )}
          </div>
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-gray-900 font-medium line-clamp-2">
              {result.title || '待生成...'}
            </p>
          )}
        </div>

        {/* 卖点 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">卖点</label>
          </div>
          {isEditing ? (
            <Textarea
              value={editedSellingPoints}
              onChange={e => setEditedSellingPoints(e.target.value)}
              rows={4}
              placeholder="每行一个卖点"
              className="text-sm"
            />
          ) : (
            <ul className="space-y-1">
              {result.sellingPoints.length > 0 ? (
                result.sellingPoints.map((point, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-blue-600 mr-1">•</span>
                    <span>{point}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-400">待生成...</li>
              )}
            </ul>
          )}
        </div>

        {/* 状态 */}
        {result.status === 'completed' && result.generatedAt && (
          <div className="text-xs text-gray-400">
            生成于 {format(result.generatedAt, 'HH:mm:ss')}
          </div>
        )}

        {/* 编辑模式按钮 */}
        {isEditing && (
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" className="flex-1" onClick={handleCancelEdit}>
              取消
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSaveEdit}>
              保存
            </Button>
          </div>
        )}

        {/* 操作按钮 */}
        {!isEditing && result.status === 'completed' && (
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onRegenerate?.(result.productId)}
            >
              重新生成
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onSaveTemplate?.(result.productId)}
            >
              收藏模板
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onExport?.(result.productId)}
            >
              导出
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
