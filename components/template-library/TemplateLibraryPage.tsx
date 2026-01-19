'use client';

import React, { useState, useEffect } from 'react';
import { Template } from '@/types';
import { storage, generateId } from '@/lib';
import { Button, Input, Textarea, Select, Modal, Tag } from '@/components/ui';
import { format } from 'date-fns';

type TemplateType = 'complete' | 'title-only' | 'selling-points-only' | 'image-only';

export const TemplateLibraryPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setTemplates(storage.templates.getAll());
  };

  const [formData, setFormData] = useState({
    name: '',
    type: 'complete' as TemplateType,
    tags: '',
    category: '',
    titleTemplate: '',
    sellingPointsTemplate: '',
  });

  const filteredTemplates = templates.filter(template => {
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesSearch = !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const templateData: Template = {
      id: editingTemplate?.id || generateId(),
      name: formData.name,
      type: formData.type,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      category: formData.category || undefined,
      content: {
        titleTemplate: formData.titleTemplate || undefined,
        sellingPointsTemplate: formData.sellingPointsTemplate
          ? formData.sellingPointsTemplate.split('\n').filter(Boolean)
          : undefined,
      },
      createdAt: editingTemplate?.createdAt || new Date(),
      usedCount: editingTemplate?.usedCount || 0,
    };

    if (editingTemplate) {
      storage.templates.update(editingTemplate.id, templateData);
    } else {
      storage.templates.add(templateData);
    }

    loadTemplates();
    handleCloseModal();
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      tags: template.tags.join(', '),
      category: template.category || '',
      titleTemplate: template.content.titleTemplate || '',
      sellingPointsTemplate: template.content.sellingPointsTemplate?.join('\n') || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      storage.templates.delete(id);
      loadTemplates();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      type: 'complete',
      tags: '',
      category: '',
      titleTemplate: '',
      sellingPointsTemplate: '',
    });
  };

  const templateTypeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'complete', label: '完整模板' },
    { value: 'title-only', label: '仅标题' },
    { value: 'selling-points-only', label: '仅卖点' },
  ];

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              模板库
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              管理和复用您的优质图文模板 ({templates.length} 个模板)
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-violet-500/25">
            <span className="mr-2">➕</span>
            新建模板
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Input
            placeholder="搜索模板名称或标签..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select
            options={templateTypeOptions}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          />
        </div>
      </div>

      {/* 模板列表 */}
      {filteredTemplates.length === 0 ? (
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {templates.length === 0 ? '暂无模板' : '没有找到匹配的模板'}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {templates.length === 0
              ? '点击"新建模板"创建您的第一个模板'
              : '尝试调整搜索条件或筛选器'}
          </p>
          {templates.length === 0 && (
            <Button onClick={() => setShowModal(true)} variant="gradient">
              创建第一个模板
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="glass-effect rounded-2xl shadow-lg border border-slate-200/50 p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <Tag key={tag} size="sm" variant="primary">
                        {tag}
                      </Tag>
                    ))}
                    {template.category && (
                      <Tag size="sm" variant="default">
                        {template.category}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>

              {/* 模板内容预览 */}
              <div className="space-y-3 mb-4">
                {template.content.titleTemplate && (
                  <div className="p-3 bg-violet-50 rounded-lg">
                    <div className="text-xs text-violet-600 font-medium mb-1">标题模板</div>
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {template.content.titleTemplate}
                    </p>
                  </div>
                )}
                {template.content.sellingPointsTemplate && (
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600 font-medium mb-1">卖点模板</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {template.content.sellingPointsTemplate.slice(0, 2).map((point, i) => (
                        <li key={i} className="line-clamp-1">• {point}</li>
                      ))}
                      {template.content.sellingPointsTemplate.length > 2 && (
                        <li className="text-xs text-slate-500">
                          ...还有 {template.content.sellingPointsTemplate.length - 2} 条
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* 元数据 */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>创建于 {format(template.createdAt, 'yyyy-MM-dd')}</span>
                {template.usedCount !== undefined && template.usedCount > 0 && (
                  <span>使用 {template.usedCount} 次</span>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEdit(template)}
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDelete(template.id)}
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 模板编辑弹窗 */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTemplate ? '编辑模板' : '新建模板'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="模板名称 *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：男包商务风标题模板"
          />

          <Select
            label="模板类型"
            options={[
              { value: 'complete', label: '完整模板' },
              { value: 'title-only', label: '仅标题' },
              { value: 'selling-points-only', label: '仅卖点' },
            ]}
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as TemplateType })}
          />

          <Input
            label="标签（逗号分隔）"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            placeholder="例如：男包, 商务, 主图"
          />

          <Input
            label="类目"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            placeholder="例如：男包"
          />

          <Textarea
            label="标题模板（支持变量：{brand}, {name}, {category}等）"
            value={formData.titleTemplate}
            onChange={e => setFormData({ ...formData, titleTemplate: e.target.value })}
            rows={2}
            placeholder="例如：{brand} {name} {category}专用"
          />

          <Textarea
            label="卖点模板（每行一条）"
            value={formData.sellingPointsTemplate}
            onChange={e => setFormData({ ...formData, sellingPointsTemplate: e.target.value })}
            rows={4}
            placeholder="例如：{material}材质，品质有保障"
          />

          <div className="flex space-x-3 pt-4">
            <Button variant="ghost" className="flex-1" onClick={handleCloseModal}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!formData.name.trim()}>
              {editingTemplate ? '保存修改' : '创建模板'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
