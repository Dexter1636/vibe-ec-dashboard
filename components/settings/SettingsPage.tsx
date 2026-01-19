'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select } from '@/components/ui';

interface SettingsState {
  // 生成规则
  defaultTitleStyle: 'professional' | 'casual' | 'promotional';
  defaultSellingPointsCount: 1 | 2 | 3;
  includeBrand: boolean;
  includeMaterial: boolean;

  // 图文风格
  imageStyle: 'simple' | 'elegant' | 'vibrant';
  fontFamily: 'default' | 'modern' | 'classic';

  // 其他配置
  autoSaveToLibrary: boolean;
  defaultCategory: string;
}

const DEFAULT_SETTINGS: SettingsState = {
  defaultTitleStyle: 'professional',
  defaultSellingPointsCount: 2,
  includeBrand: true,
  includeMaterial: true,
  imageStyle: 'simple',
  fontFamily: 'default',
  autoSaveToLibrary: false,
  defaultCategory: '',
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载设置
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有设置为默认值吗？')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('settings');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          ⚙️ 系统设置
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          配置默认生成规则和图文风格偏好
        </p>
      </div>

      {/* 生成规则设置 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mr-3">
            📝
          </span>
          生成规则
        </h3>

        <div className="space-y-6">
          <Select
            label="默认标题风格"
            options={[
              { value: 'professional', label: '专业风' },
              { value: 'casual', label: '轻松风' },
              { value: 'promotional', label: '促销风' },
            ]}
            value={settings.defaultTitleStyle}
            onChange={e => setSettings({ ...settings, defaultTitleStyle: e.target.value as any })}
          />

          <Select
            label="默认卖点数量"
            options={[
              { value: '1', label: '1条' },
              { value: '2', label: '2条' },
              { value: '3', label: '3条' },
            ]}
            value={settings.defaultSellingPointsCount.toString()}
            onChange={e => setSettings({ ...settings, defaultSellingPointsCount: parseInt(e.target.value) as any })}
          />

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeBrand}
                onChange={e => setSettings({ ...settings, includeBrand: e.target.checked })}
                className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
              />
              <div>
                <div className="font-medium text-slate-900">标题中包含品牌名</div>
                <div className="text-sm text-slate-500">自动在生成的标题中添加商品品牌</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeMaterial}
                onChange={e => setSettings({ ...settings, includeMaterial: e.target.checked })}
                className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
              />
              <div>
                <div className="font-medium text-slate-900">卖点中包含材质信息</div>
                <div className="text-sm text-slate-500">自动在卖点中强调商品材质</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 图文风格设置 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center mr-3">
            🎨
          </span>
          图文风格
        </h3>

        <div className="space-y-6">
          <Select
            label="主图样式"
            options={[
              { value: 'simple', label: '简约风格 - 白底图为主' },
              { value: 'elegant', label: '优雅风格 - 淡雅背景' },
              { value: 'vibrant', label: '活力风格 - 鲜艳色彩' },
            ]}
            value={settings.imageStyle}
            onChange={e => setSettings({ ...settings, imageStyle: e.target.value as any })}
          />

          <Select
            label="字体风格"
            options={[
              { value: 'default', label: '默认字体' },
              { value: 'modern', label: '现代无衬线' },
              { value: 'classic', label: '经典衬线' },
            ]}
            value={settings.fontFamily}
            onChange={e => setSettings({ ...settings, fontFamily: e.target.value as any })}
          />
        </div>
      </div>

      {/* 其他设置 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
            🔧
          </span>
          其他设置
        </h3>

        <div className="space-y-6">
          <Input
            label="默认商品类目"
            value={settings.defaultCategory}
            onChange={e => setSettings({ ...settings, defaultCategory: e.target.value })}
            placeholder="例如：男包"
          />

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSaveToLibrary}
              onChange={e => setSettings({ ...settings, autoSaveToLibrary: e.target.checked })}
              className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
            />
            <div>
              <div className="font-medium text-slate-900">自动保存到素材库</div>
              <div className="text-sm text-slate-500">添加商品时自动保存到素材库，方便下次复用</div>
            </div>
          </label>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex justify-between items-center">
          <Button variant="danger" onClick={handleReset}>
            重置默认
          </Button>
          <Button
            onClick={handleSave}
            className={`shadow-lg ${saved ? 'bg-green-600 hover:bg-green-700' : 'shadow-violet-500/25'}`}
          >
            {saved ? (
              <>
                <span className="mr-2">✅</span>
                已保存
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                保存设置
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
