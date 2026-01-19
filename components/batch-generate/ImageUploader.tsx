'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  label?: string;
  accept?: Record<string, string[]>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 5,
  label = '上传图片',
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = [...images, ...acceptedFiles].slice(0, maxImages);
      onChange(newImages);

      // 生成预览URL
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    },
    [images, onChange, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxImages,
    multiple: true,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);

    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  React.useEffect(() => {
    // 组件卸载时清理预览URL
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  React.useEffect(() => {
    // 当外部images变化时更新previews
    if (images.length > 0) {
      const newPreviews = images.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      return () => {
        newPreviews.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setPreviews([]);
    }
  }, [images.length]); // 只依赖length，避免循环

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">{label}</div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>拖放图片到这里...</p>
            ) : (
              <p>
                拖放图片到这里，或点击选择文件
                <br />
                <span className="text-xs text-gray-500">
                  最多 {maxImages} 张，支持 PNG, JPG, GIF, WebP
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`预览 ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File count */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          已选择 {images.length} / {maxImages} 张图片
        </p>
      )}
    </div>
  );
};
