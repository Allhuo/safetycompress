# 🚀 项目部署指南

## 📋 项目信息

- **项目名称**: Safety PDF Compressor
- **GitHub仓库**: https://github.com/Allhuo/safetycompress.git
- **项目类型**: React + TypeScript + Vite + WASM
- **主要功能**: PDF压缩工具（基于Ghostscript WASM）

## 🔧 技术栈版本

### 核心依赖
- **React**: ^18.3.1
- **TypeScript**: ~5.6.2
- **Vite**: ^6.0.1
- **Tailwind CSS**: ^3.4.17
- **Ghostscript WASM**: 自定义构建版本

### 开发工具
- **ESLint**: ^9.15.0
- **Prettier**: ^3.4.2
- **PostCSS**: ^8.5.1

## 📦 部署流程

### 1. 本地开发环境设置

```bash
# 克隆仓库
git clone https://github.com/Allhuo/safetycompress.git
cd safetycompress

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 2. GitHub推送流程

```bash
# 检查当前状态
git status

# 添加所有更改
git add .

# 提交更改（使用语义化提交信息）
git commit -m "feat: 实施WASM加载优化和真实进度监听"

# 推送到远程仓库
git push origin main
```

### 3. 版本管理策略

#### 分支命名规范
- `main`: 主分支，稳定版本
- `develop`: 开发分支
- `feature/xxx`: 功能分支
- `hotfix/xxx`: 紧急修复分支

#### 提交信息规范
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更改

## 🔐 安全注意事项

### 文件排除列表
以下文件/目录**不应**上传到GitHub：

```
# 敏感配置文件
doc/deployment-credentials.md
doc/server-config.md
.env.local
.env.production

# 构建产物
dist/
build/
node_modules/

# 开发工具
.vscode/settings.json
.idea/

# 系统文件
.DS_Store
Thumbs.db

# 日志文件
*.log
npm-debug.log*
```

### Git配置检查

```bash
# 检查当前Git配置
git config --list

# 确保用户信息正确
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## 📊 本次更新内容 (v1.1.0)

### 🚀 主要优化

1. **WebWorker后台加载**
   - 创建 `/public/wasm-loader.worker.js`
   - 实现真实下载进度监听
   - 非阻塞主线程加载

2. **WASM加载器重构**
   - 新增 `src/utils/wasm-loader.ts`
   - 支持流式下载和进度回调
   - 智能缓存和回退机制

3. **Hook系统升级**
   - 更新 `useGhostscriptCompressor.ts`
   - 增强状态管理和错误处理
   - 添加预加载数据检测

4. **构建配置优化**
   - 升级 `vite.config.ts`
   - 启用Terser压缩和缓存优化
   - 改进WASM文件处理策略

5. **类型系统完善**
   - 扩展 `types.ts`
   - 添加进度监听相关类型定义

### 📈 性能提升

- **首次加载**: 真实进度显示，用户体验大幅改善
- **二次访问**: 利用浏览器缓存，接近瞬时加载
- **内存优化**: 预加载数据复用，减少重复下载
- **稳定性**: WebWorker隔离，避免主线程阻塞

### 🐛 修复问题

- 修复进度条只显示50%→100%的问题
- 改善大文件下载时的用户等待体验
- 优化WASM模块初始化流程

## 🔄 回滚方案

如果新版本出现问题，可以通过以下方式回滚：

```bash
# 查看提交历史
git log --oneline

# 回滚到指定版本
git reset --hard <commit-hash>

# 强制推送（谨慎使用）
git push --force origin main
```

## 📞 支持联系

- **开发者**: Allhuo
- **问题反馈**: GitHub Issues
- **更新日期**: 2024-07-01 