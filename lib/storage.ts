// 本地存储工具

import { Template, Material } from '@/types';

export const storage = {
  // 模板库
  templates: {
    getAll: (): Template[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem('templates');
      return data ? JSON.parse(data, (key, value) => {
        // 日期字符串转Date对象
        if (key === 'createdAt' && value) {
          return new Date(value);
        }
        return value;
      }) : [];
    },
    save: (templates: Template[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('templates', JSON.stringify(templates));
    },
    add: (template: Template) => {
      const templates = storage.templates.getAll();
      templates.push(template);
      storage.templates.save(templates);
    },
    update: (id: string, updates: Partial<Template>) => {
      const templates = storage.templates.getAll();
      const index = templates.findIndex(t => t.id === id);
      if (index !== -1) {
        templates[index] = { ...templates[index], ...updates };
        storage.templates.save(templates);
      }
    },
    delete: (id: string) => {
      const templates = storage.templates.getAll().filter(t => t.id !== id);
      storage.templates.save(templates);
    },
    getById: (id: string): Template | undefined => {
      return storage.templates.getAll().find(t => t.id === id);
    },
  },

  // 素材库
  materials: {
    getAll: (): Material[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem('materials');
      return data ? JSON.parse(data, (key, value) => {
        // 日期字符串转Date对象
        if ((key === 'createdAt' || key === 'lastUsedAt') && value) {
          return new Date(value);
        }
        return value;
      }) : [];
    },
    save: (materials: Material[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('materials', JSON.stringify(materials));
    },
    add: (material: Material) => {
      const materials = storage.materials.getAll();
      materials.push(material);
      storage.materials.save(materials);
    },
    update: (id: string, updates: Partial<Material>) => {
      const materials = storage.materials.getAll();
      const index = materials.findIndex(m => m.id === id);
      if (index !== -1) {
        materials[index] = { ...materials[index], ...updates };
        storage.materials.save(materials);
      }
    },
    delete: (id: string) => {
      const materials = storage.materials.getAll().filter(m => m.id !== id);
      storage.materials.save(materials);
    },
    getById: (id: string): Material | undefined => {
      return storage.materials.getAll().find(m => m.id === id);
    },
  },
};

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
