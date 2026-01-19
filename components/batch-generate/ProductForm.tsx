'use client';

import React, { useState } from 'react';
import { ProductFormData, CATEGORIES, TARGET_AUDIENCES } from '@/types';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { ImageUploader } from './ImageUploader';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onCancel,
  submitLabel = '添加商品',
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    brand: '',
    material: '',
    size: '',
    color: '',
    targetAudience: '',
    images: [],
    referenceImages: [],
    referenceLinks: [],
    saveToLibrary: false,
  });

  const [referenceLinksText, setReferenceLinksText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 处理参考链接文本
    const links = referenceLinksText
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);

    onSubmit({
      ...formData,
      referenceLinks: links.length > 0 ? links : undefined,
    });

    // 重置表单
    setFormData({
      name: '',
      category: '',
      brand: '',
      material: '',
      size: '',
      color: '',
      targetAudience: '',
      images: [],
      referenceImages: [],
      referenceLinks: [],
      saveToLibrary: false,
    });
    setReferenceLinksText('');
  };

  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryOptions = [
    { value: '', label: '请选择类目' },
    ...CATEGORIES.map(cat => ({ value: cat, label: cat })),
  ];

  const audienceOptions = [
    { value: '', label: '请选择适用人群' },
    ...TARGET_AUDIENCES.map(aud => ({ value: aud, label: aud })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 必填信息 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">基础信息（必填）</h3>

        <Input
          label="商品名称 *"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="例如：男士商务真皮公文包"
          required
        />

        <Select
          label="类目 *"
          value={formData.category}
          onChange={e => updateField('category', e.target.value)}
          options={categoryOptions}
          required
        />

        <Input
          label="品牌 *"
          value={formData.brand}
          onChange={e => updateField('brand', e.target.value)}
          placeholder="例如：XX品牌"
          required
        />
      </div>

      {/* 可选信息 */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">详细信息（选填）</h3>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="材质"
            value={formData.material}
            onChange={e => updateField('material', e.target.value)}
            placeholder="例如：牛皮"
          />

          <Input
            label="尺寸"
            value={formData.size}
            onChange={e => updateField('size', e.target.value)}
            placeholder="例如：40cm x 30cm"
          />

          <Input
            label="颜色"
            value={formData.color}
            onChange={e => updateField('color', e.target.value)}
            placeholder="例如：黑色"
          />

          <Select
            label="适用人群"
            value={formData.targetAudience}
            onChange={e => updateField('targetAudience', e.target.value)}
            options={audienceOptions}
          />
        </div>
      </div>

      {/* 商品图片 */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">商品图片 *</h3>
        <ImageUploader
          images={formData.images}
          onChange={images => updateField('images', images)}
          maxImages={5}
          label="上传商品主图（白底图或简单场景图）"
        />
      </div>

      {/* 参考图片和链接 */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">参考素材（选填）</h3>

        <ImageUploader
          images={formData.referenceImages || []}
          onChange={images => updateField('referenceImages', images)}
          maxImages={3}
          label="上传历史爆款截图（可选）"
        />

        <Textarea
          label="参考链接（可选）"
          value={referenceLinksText}
          onChange={e => setReferenceLinksText(e.target.value)}
          placeholder="每行输入一个链接&#10;例如：https://example.com/product1"
          rows={3}
        />
      </div>

      {/* 保存到素材库 */}
      <div className="pt-2 border-t border-gray-200">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.saveToLibrary}
            onChange={e => updateField('saveToLibrary', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">保存此商品到素材库，方便下次使用</span>
        </label>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={!formData.name || !formData.category || !formData.brand || formData.images.length === 0}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
