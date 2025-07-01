# 📝 更新日志

## [v1.1.1] - 2024-12-28

### 🔧 修复
- **TypeScript编译错误**: 修复了`getCompressionQualities()`函数缺少`name`属性的问题
- **构建依赖**: 添加了缺失的`terser`构建依赖
- **类型定义**: 改进了压缩级别的TypeScript类型定义，使用`as const`确保类型安全

### 📦 部署
- 修复了Cloudflare Pages自动部署失败的问题
- 构建现在可以在CI/CD环境中正常工作

---

## [v1.1.0] - 2025-07-01

### 🚀 新功能
- **WebWorker后台加载**: 实现WASM文件后台下载，不阻塞主线程
- **真实进度监听**: 显示实际下载进度（MB/MB），替代跳跃式进度条
- **智能缓存机制**: 二次访问使用浏览器缓存，接近瞬时加载
- **流式下载**: 使用ReadableStream实时更新下载进度

### ⚡ 性能优化
- **构建配置优化**: 启用Terser压缩，减少产物大小
- **资源缓存策略**: 设置长期缓存，提升加载速度
- **内存管理**: 预加载数据复用，减少重复下载
- **非阻塞加载**: 用户可在下载过程中正常操作界面

### 🔧 技术改进
- **新增WebWorker**: `/public/wasm-loader.worker.js`
- **重构WASM加载器**: `src/utils/wasm-loader.ts`
- **升级Hook系统**: `useGhostscriptCompressor.ts`
- **完善类型定义**: 添加进度监听相关类型

### 🐛 修复问题
- 修复进度条只显示50%→100%的虚假进度问题
- 改善15MB WASM文件下载时的用户等待体验
- 优化大文件加载时的浏览器响应性

### 📋 文件变更
```
新增文件:
+ public/wasm-loader.worker.js
+ src/utils/wasm-loader.ts
+ doc/deployment-guide.md
+ doc/changelog.md

修改文件:
~ vite.config.ts (构建优化)
~ src/wasm/types.ts (类型扩展)
~ src/hooks/useGhostscriptCompressor.ts (功能重构)
~ src/wasm/ghostscript-compressor.ts (加载器集成)
~ .gitignore (敏感文件排除)
```

---

## [v1.0.0] - 2024-06-30

### 🎉 初始版本
- **核心功能**: PDF压缩工具基于Ghostscript WASM
- **压缩选项**: 高效压缩、平衡模式、高质量三种模式
- **用户界面**: 现代化React + TypeScript + Tailwind CSS
- **文件处理**: 支持拖拽上传，最大100MB限制
- **安全特性**: 本地处理，文件不上传服务器

### 🔧 技术栈
- React 18.3.1
- TypeScript 5.6.2
- Vite 6.0.1
- Tailwind CSS 3.4.17
- Ghostscript WASM (自定义构建)

### 📦 部署
- GitHub私有仓库部署
- 支持开发和生产环境构建
- 完整的项目文档和配置

---

## 🔄 版本规划

### v1.2.0 (规划中)
- [ ] 批量文件处理
- [ ] 压缩预览功能
- [ ] 更多压缩选项
- [ ] 国际化支持

### v1.3.0 (规划中)
- [ ] PWA支持
- [ ] 离线功能
- [ ] 压缩历史记录
- [ ] 高级统计信息

---

**维护者**: Allhuo  
**仓库**: https://github.com/Allhuo/safetycompress 