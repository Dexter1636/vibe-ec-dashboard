# 测试图片使用说明

请将您的测试商品图片放到此文件夹中。

## 图片命名规范

按类目命名，方便系统自动识别：
- 男包图片：`bag-mens-01.jpg`, `bag-mens-02.jpg`, `bag-mens-03.jpg` ...
- 女包图片：`bag-womens-01.jpg`, `bag-womens-02.jpg`, `bag-womens-03.jpg` ...
- 配饰图片：`accessory-01.jpg`, `accessory-02.jpg` ...

## 支持的图片格式

- JPG / JPEG
- PNG
- WebP

## 使用方式

将图片放入此文件夹后，点击页面上的「加载测试数据」按钮，系统会自动识别并加载这些图片生成测试商品数据。

## 快速开始

如果没有现成的测试图片，可以：
1. 从 Unsplash 等免费图库下载包包相关图片
2. 按上述命名规范重命名后放入此文件夹
3. 刷新页面后点击「加载测试数据」按钮

## 参考图（可选）

如需测试参考图功能，可以创建 `reference` 子文件夹：
```
/test-images/
  ├── bag-mens-01.jpg
  ├── bag-mens-02.jpg
  └── reference/
      ├── reference-01.jpg
      └── reference-02.jpg
```
