'use client';

import React, { useState } from 'react';
import { Header, TabType } from '@/components/layout';
import { ProductForm, ProductList, ResultPreview } from '@/components/batch-generate';
import { OverviewPage } from '@/components/home/OverviewPage';
import { TemplateLibraryPage } from '@/components/template-library/TemplateLibraryPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { TikTokStyleSelector, TikTokResultCard } from '@/components/tiktok-copy';
import { ImageAnalysisResultCard } from '@/components/image-analysis';
import { ImageStyleSelector, ProductSelector, PromptInput, ImageResultCard } from '@/components/image-generation';
import { Button, Modal } from '@/components/ui';
import { Product, ProductFormData, GeneratedContent, TikTokCopy, TikTokCopyOptions, ImageAnalysisResult, ImageGenerationOptions, GeneratedImage } from '@/types';
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

  // TikTok states
  const [tiktokOptions, setTiktokOptions] = useState<TikTokCopyOptions>({
    styleId: 'recommendation',
    targetLength: 'medium',
    includeHashtags: true,
  });
  const [tiktokResults, setTiktokResults] = useState<Map<string, TikTokCopy>>(new Map());
  const [streamingProductId, setStreamingProductId] = useState<string | null>(null);

  // Image generation states
  const [imageOptions, setImageOptions] = useState<ImageGenerationOptions>({
    styleId: 'product-cover',
    inputMode: 'product',
  });
  const [imageResults, setImageResults] = useState<Map<string, GeneratedImage>>(new Map());
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Image analysis states
  const [imageAnalysisResults, setImageAnalysisResults] = useState<Map<string, ImageAnalysisResult>>(new Map());
  const [analyzingImage, setAnalyzingImage] = useState<{productId: string, imageIndex: number} | null>(null);

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

  // 生成抖音文案
  const handleGenerateTiktok = async (product: Product) => {
    setStreamingProductId(product.id);

    // 创建初始结果（streaming 状态）
    setTiktokResults(prev => new Map(prev).set(product.id, {
      id: `${product.id}-temp`,
      productId: product.id,
      styleId: tiktokOptions.styleId,
      hook: '',
      content: '',
      cta: '',
      hashtags: [],
      status: 'streaming',
      generatedAt: new Date(),
    }));

    try {
      const response = await fetch('/api/generate/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, options: tiktokOptions }),
      });

      if (!response.ok) {
        throw new Error('Generation request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'start') {
              // 生成开始
              console.log('Generation started for product:', data.productId);
            } else if (data.type === 'streaming') {
              // 流式更新（忽略，保持 loading 状态）
              // 不再显示原始 JSON 文本
            } else if (data.type === 'complete') {
              // 用解析后的结构化数据替换
              setTiktokResults(prev => new Map(prev).set(product.id, data.result));
              setStreamingProductId(null);
            } else if (data.type === 'error') {
              console.error('Generation error:', data.error);
              setTiktokResults(prev => {
                const copy = prev.get(product.id);
                if (copy) {
                  const updated = { ...copy, status: 'failed' as const, error: data.error };
                  return new Map(prev).set(product.id, updated);
                }
                return prev;
              });
              setStreamingProductId(null);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    } catch (error) {
      console.error('TikTok generation failed:', error);
      setTiktokResults(prev => {
        const copy = prev.get(product.id);
        if (copy) {
          const updated = { ...copy, status: 'failed' as const, error: error instanceof Error ? error.message : '生成失败' };
          return new Map(prev).set(product.id, updated);
        }
        return prev;
      });
      setStreamingProductId(null);
    }
  };

  // 生成图片
  const handleGenerateImage = async () => {
    if (imageOptions.inputMode === 'product' && !selectedProductId) {
      alert('请先选择商品');
      return;
    }

    if (imageOptions.inputMode === 'manual' && !imageOptions.manualPrompt) {
      alert('请输入图片描述');
      return;
    }

    const generationId = `img-${Date.now()}`;
    setGeneratingImageId(generationId);

    // Create initial result
    const initialResult: GeneratedImage = {
      id: generationId,
      productId: selectedProductId,
      styleId: imageOptions.styleId,
      prompt: imageOptions.inputMode === 'product'
        ? 'Building from product...'
        : imageOptions.manualPrompt!,
      imageUrl: '',
      status: 'generating',
      generatedAt: new Date(),
    };
    setImageResults(prev => new Map(prev).set(generationId, initialResult));

    try {
      const product = selectedProductId
        ? products.find(p => p.id === selectedProductId)
        : undefined;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: imageOptions,
          product,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      setImageResults(prev => new Map(prev).set(generationId, data.result));
    } catch (error) {
      console.error('Image generation failed:', error);
      setImageResults(prev => {
        const result = prev.get(generationId);
        if (result) {
          return new Map(prev).set(generationId, {
            ...result,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : '生成失败',
          });
        }
        return prev;
      });
    } finally {
      setGeneratingImageId(null);
    }
  };

  // 处理图片分析
  const handleAnalyzeImage = async (productId: string, imageIndex: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const key = `${productId}-${imageIndex}`;
    setAnalyzingImage({ productId, imageIndex });

    // Set initial analyzing status
    setImageAnalysisResults(prev => new Map(prev).set(key, {
      id: key,
      productId,
      imageIndex,
      imageUrl: product.images[imageIndex],
      sellingPoints: [],
      keywords: [],
      visualFeatures: { colors: [], style: '' },
      status: 'analyzing',
    }));

    try {
      // Convert blob URL to base64 on client side
      const imageUrl = product.images[imageIndex];
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert blob to base64 (keep data URL prefix for Qwen API)
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Send to API with base64 image data
      const apiResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, imageIndex, base64Image }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await apiResponse.json();
      setImageAnalysisResults(prev => new Map(prev).set(key, data.result));
    } catch (error) {
      console.error('Image analysis failed:', error);
      setImageAnalysisResults(prev => {
        const result = prev.get(key);
        if (result) {
          return new Map(prev).set(key, {
            ...result,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Analysis failed',
          });
        }
        return prev;
      });
    } finally {
      setAnalyzingImage(null);
    }
  };

  // 检查是否有分析结果
  const hasAnalysisResult = (productId: string, imageIndex: number) => {
    return imageAnalysisResults.has(`${productId}-${imageIndex}`);
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
            onAnalyzeImage={handleAnalyzeImage}
            analyzingImage={analyzingImage}
            hasAnalysisResult={hasAnalysisResult}
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

      {/* 图片分析结果 */}
      {imageAnalysisResults.size > 0 && (
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              图片分析结果
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              AI视觉分析提取的卖点和关键词
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(imageAnalysisResults.values()).map(result => {
              const product = products.find(p => p.id === result.productId);
              if (!product) return null;

              return (
                <div key={result.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-xs text-gray-500">图片 {result.imageIndex + 1}</p>
                  </div>
                  <div className="p-4">
                    <ImageAnalysisResultCard result={result} productName={product.name} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染抖音文案页面
  const renderTiktokPage = () => (
    <div className="space-y-8">
      {/* 全局生成进度提示 */}
      {streamingProductId && (
        <div className="glass-effect rounded-2xl shadow-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 animate-ping opacity-75"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-900">AI 正在生成文案...</p>
                <p className="text-xs text-violet-600">DeepSeek V3.2 正在为您创作，请稍候</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-transparent animate-spin"></div>
              <span className="text-xs text-violet-600 font-medium">生成中</span>
            </div>
          </div>
        </div>
      )}

      {/* 顶部：风格选择 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            抖音/短视频文案生成
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            AI生成多风格短视频带货文案
          </p>
        </div>

        <TikTokStyleSelector
          options={tiktokOptions}
          onChange={setTiktokOptions}
          disabled={streamingProductId !== null}
        />
      </div>

      {/* 商品列表 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              商品列表 ({products.length})
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              选择商品生成对应风格的抖音文案
            </p>
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

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const tiktokCopy = tiktokResults.get(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* 商品图片 */}
                  <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-100 relative overflow-hidden">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {tiktokCopy?.status === 'streaming' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="animate-spin text-3xl mb-2">⏳</div>
                          <p className="text-sm font-medium">AI生成中...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 商品信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.category} · {product.brand}
                    </p>

                    {/* 生成按钮 */}
                    {!tiktokCopy && (
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleGenerateTiktok(product)}
                        disabled={streamingProductId !== null}
                      >
                        <span className="mr-1">🎬</span>
                        生成文案
                      </Button>
                    )}

                    {/* 重新生成按钮 */}
                    {tiktokCopy && tiktokCopy.status !== 'streaming' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => handleGenerateTiktok(product)}
                        disabled={streamingProductId !== null}
                      >
                        <span className="mr-1">🔄</span>
                        重新生成
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无商品</h3>
            <p className="text-sm text-slate-500 mb-4">
              点击上方"添加商品"按钮，或加载测试数据
            </p>
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

      {/* 生成结果 */}
      {tiktokResults.size > 0 && (
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              生成结果
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              已为 {Array.from(tiktokResults.values()).filter(r => r.status === 'completed').length} / {products.length} 个商品生成文案
            </p>
          </div>

          <div className="space-y-6">
            {products.map(product => {
              const copy = tiktokResults.get(product.id);
              if (!copy) return null;

              return (
                <div key={product.id} className="space-y-2">
                  <h3 className="text-md font-semibold text-gray-800">{product.name}</h3>
                  <TikTokResultCard copy={copy} productName={product.name} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染图片生成页面
  const renderImageGenerationPage = () => (
    <div className="space-y-8">
      {/* 全局生成进度 */}
      {generatingImageId && (
        <div className="glass-effect rounded-2xl shadow-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg">🎨</span>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 animate-ping opacity-75"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-900">AI 正在绘图...</p>
                <p className="text-xs text-violet-600">Qwen-Image 正在为您生成，预计需要 30-120 秒</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-transparent animate-spin"></div>
              <span className="text-xs text-violet-600 font-medium">生成中</span>
            </div>
          </div>
        </div>
      )}

      {/* 样式选择和输入 */}
      <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI 图片生成
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            使用 AI 生成电商海报、商品首图和社交媒体配图
          </p>
        </div>

        <ImageStyleSelector
          options={imageOptions}
          onChange={setImageOptions}
          disabled={generatingImageId !== null}
        />

        {/* Input Mode: Product Selection */}
        {imageOptions.inputMode === 'product' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <ProductSelector
              products={products}
              selectedProductId={selectedProductId}
              onSelect={setSelectedProductId}
              disabled={generatingImageId !== null}
            />
          </div>
        )}

        {/* Input Mode: Manual Prompt */}
        {imageOptions.inputMode === 'manual' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <PromptInput
              value={imageOptions.manualPrompt || ''}
              onChange={(value) => setImageOptions({ ...imageOptions, manualPrompt: value })}
              disabled={generatingImageId !== null}
            />
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleGenerateImage}
            disabled={generatingImageId !== null}
            variant="gradient"
            className="shadow-xl shadow-purple-500/25"
          >
            <span className="mr-2">🎨</span>
            开始生成
          </Button>
        </div>
      </div>

      {/* Results */}
      {imageResults.size > 0 && (
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200/50 p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              生成结果
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              已生成 {Array.from(imageResults.values()).filter(r => r.status === 'completed').length} 张图片
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(imageResults.values()).map(result => {
              const product = result.productId
                ? products.find(p => p.id === result.productId)
                : undefined;

              return (
                <ImageResultCard
                  key={result.id}
                  result={result}
                  productName={product?.name}
                  onCopyUrl={() => {
                    navigator.clipboard.writeText(result.imageUrl);
                    alert('链接已复制到剪贴板');
                  }}
                />
              );
            })}
          </div>
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
        {activeTab === 'tiktok' && renderTiktokPage()}
        {activeTab === 'image-generation' && renderImageGenerationPage()}
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
