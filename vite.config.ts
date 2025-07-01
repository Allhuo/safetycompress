import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 生成 gzip 压缩文件（特别针对WASM文件）
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 只压缩大于1KB的文件
      deleteOriginFile: false, // 保留原文件
      filter: /\.(js|mjs|json|css|html|wasm)$/i, // 包含WASM文件
    }),
    // 生成 brotli 压缩文件（更好的压缩率）
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|wasm)$/i, // 包含WASM文件
    })
  ],
  
  build: {
    rollupOptions: {
      output: {
        // 将WASM文件单独处理，使用更好的缓存策略
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.wasm')) {
            return 'wasm/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
        // 手动分块，将WASM文件分离
        manualChunks: (id) => {
          if (id.includes('gs.wasm')) {
            return 'ghostscript-wasm';
          }
        }
      }
    },
    // 优化压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
    },
    // 设置较大的chunk警告大小，因为我们的WASM文件很大
    chunkSizeWarningLimit: 20000, // 20MB
    // 启用压缩大小报告
    reportCompressedSize: true,
    // 增大资源内联阈值（小文件内联，大文件如WASM保持分离）
    assetsInlineLimit: 4096, // 4KB以下内联
  },
  
  server: {
    headers: {
      // 启用SharedArrayBuffer支持（WASM需要）
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      // 优化缓存策略
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  // 预览模式也启用压缩
  preview: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp', 
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  optimizeDeps: {
    exclude: ['@/wasm'] // 排除WASM模块的预构建
  },
  
  assetsInclude: ['**/*.wasm'], // 包含WASM文件作为资源
  
  // 确保正确处理WASM文件的MIME类型
  define: {
    // 可以在这里定义一些编译时常量
  },
})
