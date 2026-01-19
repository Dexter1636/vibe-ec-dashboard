#!/bin/bash

# 测试图片下载脚本
# 用于快速下载 Unsplash 上的包包图片作为测试数据

TEST_IMAGES_DIR="public/test-images"

# 确保目标目录存在
mkdir -p "$TEST_IMAGES_DIR"

echo "开始下载测试图片到 $TEST_IMAGES_DIR ..."

# 定义要下载的图片（使用 Unsplash Source）
# 男包图片
curl -L "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80" -o "$TEST_IMAGES_DIR/bag-mens-01.jpg"
curl -L "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" -o "$TEST_IMAGES_DIR/bag-mens-02.jpg"

# 女包图片
curl -L "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80" -o "$TEST_IMAGES_DIR/bag-womens-01.jpg"
curl -L "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80" -o "$TEST_IMAGES_DIR/bag-womens-02.jpg"

# 配饰图片
curl -L "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" -o "$TEST_IMAGES_DIR/accessory-01.jpg"
curl -L "https://q0.itc.cn/images01/20240804/a316f130189f4d9a9c150ff9b4d9d380.jpeg?w=800&q=80" -o "$TEST_IMAGES_DIR/accessory-02.jpg"

echo "✓ 测试图片下载完成！"
echo "现在您可以在应用中点击「加载测试数据」按钮来测试功能。"
echo ""
echo "下载的图片："
ls -lh "$TEST_IMAGES_DIR"/*.jpg
