import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // 启用SharedArrayBuffer支持（WASM需要）
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@/wasm'] // 排除WASM模块的预构建
  },
  assetsInclude: ['**/*.wasm'], // 包含WASM文件作为资源
})
