# PDF 压缩工具

> 安全压缩，本地完成 - 永不上传文件的PDF压缩工具

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)

## 🌟 产品亮点

这不是另一个PDF压缩工具，这是一个**隐私保护方案**。

### 三大核心优势

- **🔒 架构级安全**: 纯前端处理，文件永不上传
- **🔍 极致透明**: 100%开源，邀请全世界审查代码
- **⚡ 简洁高效**: 干净、快速、无广告的体验

## 🚀 核心功能

- ✅ **客户端处理**: 所有PDF处理都在浏览器中完成
- ✅ **隐私保护**: 文件从始至终不接触服务器
- ✅ **多种压缩模式**: 平衡、高效压缩、高质量三种选择
- ✅ **拖拽上传**: 支持拖拽和点击上传
- ✅ **实时进度**: 清晰的处理状态和进度显示
- ✅ **即时下载**: 压缩完成立即下载
- ✅ **无需注册**: 即用即走，无任何注册要求

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **PDF处理**: pdf-lib
- **代码规范**: ESLint + Prettier

## 🏁 快速开始

### 环境要求

- Node.js >= 20.19.0
- npm 或 yarn

### 安装与运行

```bash
# 克隆项目
git clone <your-repo-url>
cd safety-pdf-compressor

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🏗️ 项目结构

```
safety-pdf-compressor/
├── src/
│   ├── components/          # React组件
│   │   ├── Header.tsx      # 页头组件
│   │   ├── HeroSection.tsx # 英雄区域
│   │   ├── PDFUploader.tsx # 文件上传组件
│   │   ├── CompressionOptions.tsx # 压缩选项
│   │   ├── ProcessingStatus.tsx   # 处理状态
│   │   ├── HowItWorks.tsx  # 工作原理
│   │   ├── KeyFeatures.tsx # 核心功能
│   │   └── Footer.tsx      # 页脚
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── public/                 # 静态资源
├── index.html             # HTML模板
└── README.md              # 项目文档
```

## 🔧 配置说明

### Tailwind CSS

项目使用Tailwind CSS进行样式管理，配置文件：`tailwind.config.js`

自定义颜色变量：
- `primary`: #197fe5 (主色调)
- `secondary`: #eff6ff (次要色)
- `accent`: #f59e0b (强调色)

### ESLint & Prettier

代码质量和格式化配置：
- ESLint: 代码质量检查
- Prettier: 代码格式化
- 支持TypeScript语法检查

## 🔐 隐私与安全

### 数据处理原则

1. **零上传**: 文件在本地浏览器中处理，永不上传到服务器
2. **零存储**: 不在本地或远程存储任何用户文件
3. **零追踪**: 不收集任何用户数据或使用分析工具
4. **开源透明**: 所有代码公开，欢迎社区审查

### 技术实现

使用 `pdf-lib` 库在浏览器中直接处理PDF文件：
- 基于WebAssembly技术，接近原生性能
- 纯JavaScript实现，无需服务器端处理
- 支持现代浏览器的File API

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 规范
- 组件使用函数式写法和 React Hooks
- 保持代码简洁和可读性

## 📋 待办事项

- [ ] 添加更多PDF优化选项
- [ ] 支持批量文件处理
- [ ] 添加国际化支持
- [ ] 性能监控和优化
- [ ] 单元测试覆盖
- [ ] 无障碍访问优化

## 📜 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- [pdf-lib](https://pdf-lib.js.org/) - 强大的PDF处理库
- [React](https://reactjs.org/) - 用户界面框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

**理念**: 在用户隐私和数据安全日益重要的今天，我们相信工具应该为用户服务，而不是将用户作为产品。这个项目证明了在保护隐私的同时提供卓越用户体验是完全可能的。
