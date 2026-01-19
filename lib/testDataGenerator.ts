/**
 * 测试数据生成器
 * 用于快速生成测试商品数据
 */

import { ProductFormData } from '@/types';

// 预设的测试商品数据模板
export const testProductTemplates = [
  {
    name: '男士商务真皮公文包',
    category: '男包',
    brand: 'VIIBE',
    material: '头层牛皮',
    size: '40cm x 30cm x 10cm',
    color: '黑色',
    targetAudience: '商务人士',
    imageFileName: 'bag-mens-01.jpg',
  },
  {
    name: '男士休闲斜挎包',
    category: '男包',
    brand: 'VIIBE',
    material: 'PU皮',
    size: '35cm x 25cm x 8cm',
    color: '棕色',
    targetAudience: '年轻男士',
    imageFileName: 'bag-mens-02.jpg',
  },
  {
    name: '女士时尚手提包',
    category: '女包',
    brand: 'VIIBE',
    material: '羊皮',
    size: '30cm x 22cm x 12cm',
    color: '米白色',
    targetAudience: '都市女性',
    imageFileName: 'bag-womens-01.jpg',
  },
  {
    name: '女士通勤双肩包',
    category: '女包',
    brand: 'VIIBE',
    material: '尼龙 + 牛皮',
    size: '38cm x 28cm x 15cm',
    color: '粉色',
    targetAudience: '学生/上班族',
    imageFileName: 'bag-womens-02.jpg',
  },
  {
    name: '商务皮带礼盒',
    category: '配饰',
    brand: 'VIIBE',
    material: '牛皮',
    size: '3.5cm x 110cm',
    color: '黑色',
    targetAudience: '商务男士',
    imageFileName: 'accessory-01.jpg',
  },
  {
    name: '奥迪Q6旗舰SUV',
    category: '汽车',
    brand: 'Audi',
    material: '铝合金+真皮',
    size: '5099mm x 2014mm x 1784mm',
    color: '天云灰',
    targetAudience: '商务精英/家庭用户',
    imageFileName: 'accessory-02.jpg',
  },
];

/**
 * 生成测试商品数据
 * @param options 选项
 * @returns 测试商品数据列表
 */
export async function generateTestData(options?: {
  count?: number;
  useRealImages?: boolean;
}): Promise<ProductFormData[]> {
  const { count = 3, useRealImages = true } = options || {};

  // 随机选择指定数量的商品模板
  const shuffled = [...testProductTemplates].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, Math.min(count, testProductTemplates.length));

  // 生成商品数据
  const products: ProductFormData[] = await Promise.all(
    selectedTemplates.map(async (template, index) => {
      // 准备图片文件
      let images: File[] = [];

      if (useRealImages) {
        // 尝试从测试图片文件夹加载
        try {
          const imageUrl = `/test-images/${template.imageFileName}`;
          const response = await fetch(imageUrl);

          if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], template.imageFileName, { type: blob.type });
            images = [file];
          } else {
            // 图片不存在，使用占位图
            console.warn(`测试图片不存在: ${template.imageFileName}`);
          }
        } catch (error) {
          console.warn(`加载测试图片失败: ${template.imageFileName}`, error);
        }
      }

      return {
        name: template.name,
        category: template.category,
        brand: template.brand,
        material: template.material,
        size: template.size,
        color: template.color,
        targetAudience: template.targetAudience,
        images,
        referenceImages: [],
        referenceLinks: [],
        saveToLibrary: false,
      };
    })
  );

  return products;
}

/**
 * 检查测试图片是否可用
 */
export async function checkTestImages(): Promise<string[]> {
  const availableImages: string[] = [];

  for (const template of testProductTemplates) {
    try {
      const response = await fetch(`/test-images/${template.imageFileName}`);
      if (response.ok) {
        availableImages.push(template.imageFileName);
      }
    } catch (error) {
      // 图片不可用，忽略
    }
  }

  return availableImages;
}
