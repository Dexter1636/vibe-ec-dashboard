'use client';

import React from 'react';

export type TabType = 'home' | 'batch-generate' | 'template-library' | 'settings';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'home' as const, label: '首页', icon: '🏠', description: '项目概览' },
  { id: 'batch-generate' as const, label: '商品任务', icon: '✨', description: '批量生成' },
  { id: 'template-library' as const, label: '模板库', icon: '📋', description: '图文模板' },
  { id: 'settings' as const, label: '设置', icon: '⚙️', description: '参数配置' },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                运营内容生成工具
              </h1>
              <p className="text-xs text-slate-500">AI-powered Content Generator</p>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex items-center space-x-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative group px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 ease-out
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
