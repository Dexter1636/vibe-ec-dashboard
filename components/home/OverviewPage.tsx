'use client';

import React from 'react';
import { Product, GeneratedContent, Template } from '@/types';
import { storage } from '@/lib';

interface OverviewPageProps {
  products: Product[];
  results: Map<string, GeneratedContent>;
  onNavigate: (tab: 'batch-generate' | 'template-library' | 'settings') => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ products, results, onNavigate }) => {
  const [templates, setTemplates] = React.useState<Template[]>([]);

  React.useEffect(() => {
    setTemplates(storage.templates.getAll());
  }, []);

  const stats = [
    {
      title: '商品总数',
      value: products.length,
      icon: '📦',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: '已完成生成',
      value: Array.from(results.values()).filter(r => r.status === 'completed').length,
      icon: '✅',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '模板收藏',
      value: templates.length,
      icon: '⭐',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: '待处理',
      value: products.length - Array.from(results.values()).filter(r => r.status === 'completed').length,
      icon: '⏳',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const completionRate = products.length > 0
    ? Math.round((Array.from(results.values()).filter(r => r.status === 'completed').length / products.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 欢迎区域 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
          欢迎使用运营内容生成工具
        </h1>
        <p className="text-slate-600">
          AI驱动的批量图文生成，让运营内容创作更高效
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`glass-effect rounded-2xl shadow-lg border border-slate-200/50 p-6 hover-lift animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-600">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* 进度概览 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
          任务完成进度
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">完成率</span>
            <span className="text-sm font-bold text-violet-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          {products.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              暂无任务，前往"商品任务"页面开始添加商品
            </p>
          )}
        </div>
      </div>

      {/* 快速操作 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
          快速开始
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 hover:border-violet-300 transition-all group cursor-pointer hover-lift"
            onClick={() => onNavigate('batch-generate')}
          >
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
              添加商品
            </h3>
            <p className="text-sm text-slate-600">
              录入商品信息，开始批量生成
            </p>
          </div>
          <div
            className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:border-amber-300 transition-all group cursor-pointer hover-lift"
            onClick={() => onNavigate('template-library')}
          >
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
              收藏模板
            </h3>
            <p className="text-sm text-slate-600">
              将优质内容保存为可复用模板
            </p>
          </div>
          <div
            className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all group cursor-pointer hover-lift"
            onClick={() => onNavigate('settings')}
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              配置参数
            </h3>
            <p className="text-sm text-slate-600">
              自定义生成规则和风格偏好
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
