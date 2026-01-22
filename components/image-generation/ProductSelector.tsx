'use client';

import React from 'react';
import { Product } from '@/types';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string | null;
  onSelect: (productId: string) => void;
  disabled?: boolean;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onSelect,
  disabled,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-gray-200">
        <span className="text-4xl mb-2 block">📦</span>
        <p className="text-sm text-gray-600">
          暂无商品，请先在"商品任务"标签添加商品
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-3 block">
        选择商品 <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(product.id)}
            className={`
              relative rounded-xl border-2 overflow-hidden transition-all
              ${selectedProductId === product.id
                ? 'border-violet-500 ring-2 ring-violet-200'
                : 'border-gray-200 hover:border-violet-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
            `}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-100 relative">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-3xl">📦</span>
                </div>
              )}

              {/* Selected indicator */}
              {selectedProductId === product.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3 bg-white">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {product.category}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
