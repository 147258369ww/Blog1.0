import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import viteCompression from 'vite-plugin-compression'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  // HTTPS 配置 - 从环境变量读取证书路径
  let httpsConfig: any = false
  if (env.VITE_SSL_KEY_PATH && env.VITE_SSL_CERT_PATH) {
    try {
      httpsConfig = {
        key: fs.readFileSync(path.resolve(__dirname, env.VITE_SSL_KEY_PATH)),
        cert: fs.readFileSync(path.resolve(__dirname, env.VITE_SSL_CERT_PATH))
      }
    } catch (error) {
      console.warn('无法加载 SSL 证书，将使用 HTTP 模式:', error)
    }
  }
  
  return {
  // 确保资源路径正确 - Vercel 部署时使用根路径
  base: '/',
  server: {
    port: parseInt(env.VITE_APP_PORT) || 5173,
    host: true,
    https: httpsConfig
  },
  plugins: [
    vue(),
    // Gzip压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于10kb的文件才压缩
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    // Brotli压缩 (可选, 更高压缩率)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动分块策略
        manualChunks: {
          // Vue核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // HTTP客户端
          'http-vendor': ['axios']
        },
        // 简化文件命名，避免路径问题
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 分块大小警告限制 (500kb)
    chunkSizeWarningLimit: 500,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 压缩配置 (使用 esbuild, 更快)
    minify: 'esbuild',
    // 生成source map用于调试
    sourcemap: false,
    // 确保生成正确的资源清单
    manifest: false,
    // 小于此阈值的导入或引用资源将内联为 base64 编码
    assetsInlineLimit: 4096
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
}})
