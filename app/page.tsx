'use client';

import React, { useState } from 'react';
import { Header, TabType } from '@/components/layout';
import { ProductForm, ProductList, ResultPreview } from '@/components/batch-generate';
import { OverviewPage } from '@/components/home/OverviewPage';
import { TemplateLibraryPage } from '@/components/template-library/TemplateLibraryPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Button, Modal } from '@/components/ui';
import { Product, ProductFormData, GeneratedContent } from '@/types';
import { generateBatchContent, generateId, storage, generateTestData, checkTestImages } from '@/lib';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Map<string, GeneratedContent>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCount, setGeneratingCount] = useState({ current: 0, total: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoadingTestData, setIsLoadingTestData] = useState(false);

  // 添加商品
  const handleAddProduct = (formData: ProductFormData) => {
    const id = generateId();

    // 将File转换为URL（在实际应用中应该上传到服务器）
    const images = formData.images.map(file => URL.createObjectURL(file));
    const referenceImages = formData.referenceImages?.map(file => URL.createObjectURL(file));

    const newProduct: Product = {
      id,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      material: formData.material,
      size: formData.size,
      color: formData.color,
      targetAudience: formData.targetAudience,
      images,
      referenceImages,
      referenceLinks: formData.referenceLinks,
      saveToLibrary: formData.saveToLibrary,
      createdAt: new Date(),
    };

    setProducts(prev => [...prev, newProduct]);
    setShowAddModal(false);

    // 如果需要保存到素材库
    if (formData.saveToLibrary) {
      storage.materials.add(newProduct);
    }
  };

  // 编辑商品
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  // 更新商品
  const handleUpdateProduct = (formData: ProductFormData) => {
    if (!editingProduct) return;

    const images = formData.images.map(file => URL.createObjectURL(file));
    const referenceImages = formData.referenceImages?.map(file => URL.createObjectURL(file));

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      material: formData.material,
      size: formData.size,
      color: formData.color,
      targetAudience: formData.targetAudience,
      images,
      referenceImages,
      referenceLinks: formData.referenceLinks,
      saveToLibrary: formData.saveToLibrary,
    };

    setProducts(prev =>
      prev.map(p => (p.id === editingProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
    setShowAddModal(false);
  };

  // 删除商品
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setResults(prev => {
      const newResults = new Map(prev);
      newResults.delete(id);
      return newResults;
    });
  };

  // 生成内容
  const handleGenerate = async () => {
    if (products.length === 0) return;

    setIsGenerating(true);
    setGeneratingCount({ current: 0, total: products.length });

    // 先设置为pending状态
    const pendingResults = new Map<string, GeneratedContent>();
    products.forEach(product => {
      const existingResult = results.get(product.id);
      pendingResults.set(product.id, {
        productId: product.id,
        mainImage: {
          originalImage: product.images[0] || '',
          generatedImage: '',
        },
        title: '',
        sellingPoints: [],
        status: 'pending',
      });
    });
    setResults(pendingResults);

    try {
      const generated = await generateBatchContent(
        products,
        (current, total) => {
          setGeneratingCount({ current, total });
        }
      );

      setResults(generated);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 重新生成单个
  const handleRegenerate = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // 更新状态为generating
    setResults(prev => {
      const newResults = new Map(prev);
      newResults.set(productId, {
        ...newResults.get(productId)!,
        status: 'generating',
      });
      return newResults;
    });

    try {
      const { generateContent } = await import('@/lib/mockGenerator');
      const result = await generateContent(product);

      setResults(prev => {
        const newResults = new Map(prev);
        newResults.set(productId, result);
        return newResults;
      });
    } catch (error) {
      console.error('重新生成失败:', error);
    }
  };

  // 编辑结果
  const handleEditResult = (productId: string, data: { title: string; sellingPoints: string[] }) => {
    setResults(prev => {
      const newResults = new Map(prev);
      const result = newResults.get(productId);
      if (result) {
        newResults.set(productId, {
          ...result,
          title: data.title,
          sellingPoints: data.sellingPoints,
        });
      }
      return newResults;
    });
  };

  // 导出单个结果
  const handleExport = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const result = results.get(productId);

    if (!product || !result || result.status !== 'completed') {
      alert('请先生成内容');
      return;
    }

    const exportData = {
      product: {
        name: product.name,
        category: product.category,
        brand: product.brand,
        material: product.material,
        size: product.size,
        color: product.color,
        targetAudience: product.targetAudience,
      },
      generated: {
        title: result.title,
        sellingPoints: result.sellingPoints,
      },
    };

    // 下载JSON文件
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name}_生成结果.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出全部结果
  const handleExportAll = () => {
    const allResults = products.map(product => {
      const result = results.get(product.id);
      return {
        product: {
          name: product.name,
          category: product.category,
          brand: product.brand,
        },
        result: result && result.status === 'completed' ? {
          title: result.title,
          sellingPoints: result.sellingPoints,
        } : null,
      };
    });

    const blob = new Blob([JSON.stringify(allResults, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `批量生成结果_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 收藏模板（占位）
  const handleSaveTemplate = (productId: string) => {
    alert('模板库功能将在后续版本中实现');
  };

  // 加载测试数据
  const handleLoadTestData = async () => {
    setIsLoadingTestData(true);

    try {
      // 先检查有多少测试图片可用
      const availableImages = await checkTestImages();

      if (availableImages.length === 0) {
        alert(
          '未找到测试图片。\n\n' +
          '请将测试图片放到 /public/test-images/ 文件夹中，' +
          '并按照以下命名规范命名：\n' +
          '- bag-mens-01.jpg, bag-mens-02.jpg (男包)\n' +
          '- bag-womens-01.jpg, bag-womens-02.jpg (女包)\n' +
          '- accessory-01.jpg (配饰)\n\n' +
          '详细说明请查看 /public/test-images/README.md'
        );
        setIsLoadingTestData(false);
        return;
      }

      // 生成测试数据（数量与可用图片数量相同，最多6个）
      const testDataProducts = await generateTestData({
        count: Math.min(availableImages.length, 6),
        useRealImages: true,
      });

      // 批量添加到商品列表
      for (const formData of testDataProducts) {
        const id = generateId();

        // 将File转换为URL
        const images = formData.images.map(file => URL.createObjectURL(file));

        const newProduct: Product = {
          id,
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          material: formData.material,
          size: formData.size,
          color: formData.color,
          targetAudience: formData.targetAudience,
          images,
          referenceImages: [],
          referenceLinks: formData.referenceLinks,
          saveToLibrary: formData.saveToLibrary,
          createdAt: new Date(),
        };

        setProducts(prev => [...prev, newProduct]);
      }

      // 显示成功提示
      alert(`已成功加载 ${testDataProducts.length} 个测试商品！\n\n现在您可以点击「开始生成全部」按钮来测试内容生成功能。`);
    } catch (error) {
      console.error('加载测试数据失败:', error);
      alert('加载测试数据失败，请查看控制台错误信息。');
    } finally {
      setIsLoadingTestData(false);
    }
  };

  // 渲染商品任务页面
  const renderBatchGeneratePage = () => (
    <div className="space-y-8">
      {/* 顶部：添加商品 + 商品列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：商品列表 */}
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 hover-lift animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                商品管理
              </h2>
              <p className="text-sm text-slate-500 mt-1">添加和管理您的商品信息</p>
            </div>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => {
                setEditingProduct(null);
                setShowAddModal(true);
              }}
              className="shadow-lg shadow-purple-500/25"
            >
              <span className="mr-1">✨</span>
              添加商品
            </Button>
          </div>
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>

        {/* 右侧：商品列表概览 */}
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 hover-lift animate-fade-in">
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
            已添加商品 ({products.length})
          </h2>
          {products.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50 hover:border-violet-300 transition-all group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 font-semibold text-sm flex-shrink-0">
                      {product.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-violet-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.category} · {product.brand}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    {results.get(product.id)?.status === 'completed' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                        ✓ 已完成
                      </span>
                    )}
                    {results.get(product.id)?.status === 'generating' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-sm animate-pulse">
                        生成中...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无商品</h3>
              <p className="text-sm text-slate-500 mb-4">点击上方"添加商品"按钮，或</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadTestData}
                disabled={isLoadingTestData}
                className="mx-auto"
              >
                {isLoadingTestData ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    加载中...
                  </>
                ) : (
                  <>
                    <span className="mr-1">🚀</span>
                    加载测试数据
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 生成按钮和进度条 */}
      {products.length > 0 && (
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                AI 批量生成
              </h2>
              <p className="text-sm text-slate-500 mt-1">使用AI自动生成商品主图、标题和卖点</p>
            </div>
            {!isGenerating && (
              <Button
                onClick={handleGenerate}
                disabled={products.length === 0}
                className="shadow-xl shadow-violet-500/25"
              >
                <span className="mr-2">✨</span>
                开始生成全部 ({products.length})
              </Button>
            )}
          </div>

          {/* 进度条 */}
          {isGenerating && (
            <div className="space-y-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-violet-700">AI生成中...</span>
                <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {generatingCount.current} / {generatingCount.total}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-3 shadow-inner overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{
                    width: `${(generatingCount.current / generatingCount.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                预计剩余时间：{Math.max(0, (generatingCount.total - generatingCount.current) * 2)} 秒
              </p>
            </div>
          )}

          {/* 完成提示 */}
          {!isGenerating && results.size > 0 && (
            <div className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-semibold text-green-700">
                已完成{' '}
                {Array.from(results.values()).filter(r => r.status === 'completed').length} /{' '}
                {products.length} 个商品的内容生成
              </span>
            </div>
          )}
        </div>
      )}

      {/* 生成结果 */}
      {results.size > 0 && (
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              生成结果
            </h2>
            <p className="text-sm text-slate-500 mt-1">查看、编辑和导出AI生成的内容</p>
          </div>
          <ResultPreview
            products={products}
            results={results}
            onRegenerate={handleRegenerate}
            onSaveTemplate={handleSaveTemplate}
            onExport={handleExport}
            onExportAll={handleExportAll}
            onEdit={handleEditResult}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-purple-50/20">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <OverviewPage products={products} results={results} onNavigate={setActiveTab} />}
        {activeTab === 'batch-generate' && renderBatchGeneratePage()}
        {activeTab === 'template-library' && <TemplateLibraryPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* 添加商品弹窗 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? '编辑商品' : '添加商品'}
        size="lg"
      >
        <ProductForm
          submitLabel={editingProduct ? '保存修改' : '添加商品'}
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
}
