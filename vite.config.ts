import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
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
    // 启用gzip压缩预计算
    reportCompressedSize: true,
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
