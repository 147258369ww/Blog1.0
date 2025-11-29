import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import { htmlEnvPlugin } from './vite-plugin-html-env'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  // 从环境变量读取HTTPS配置
  const httpsEnabled = env.VITE_HTTPS_ENABLED === 'true'
  let httpsConfig = undefined

  if (httpsEnabled && env.VITE_HTTPS_CERT_PATH && env.VITE_HTTPS_KEY_PATH) {
    const certPath = path.resolve(__dirname, env.VITE_HTTPS_CERT_PATH)
    const keyPath = path.resolve(__dirname, env.VITE_HTTPS_KEY_PATH)

    // 检查证书文件是否存在
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsConfig = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      }
    } else {
      console.warn('HTTPS证书文件不存在，将使用HTTP协议')
    }
  }

  return {
    server: {
      port: parseInt(env.VITE_PORT) || 3001,
      host: true,
      https: httpsConfig,
    },
    plugins: [
      vue(),
      htmlEnvPlugin(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // Gzip 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 大于 10KB 的文件才压缩
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Brotli 压缩（可选，压缩率更高）
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`,
        },
      },
    },
    build: {
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // 生成 sourcemap（生产环境可关闭）
      sourcemap: false,
      // 压缩选项
      minify: 'esbuild', // 使用 esbuild 压缩，速度更快
      rollupOptions: {
        output: {
          // 静态资源分类打包
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: assetInfo => {
            const info = assetInfo.name?.split('.')
            let extType = info?.[info.length - 1]
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
              extType = 'images'
            } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              extType = 'fonts'
            } else if (/\.css$/i.test(assetInfo.name || '')) {
              extType = 'css'
            }
            return `${extType}/[name]-[hash][extname]`
          },
          manualChunks: {
            // Vue 核心库
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // Element Plus UI 库
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            // ECharts 图表库
            echarts: ['echarts'],
            // Axios HTTP 库
            axios: ['axios'],
            // Quill 富文本编辑器
            quill: ['quill'],
            // Sortable 拖拽库
            sortable: ['sortablejs'],
          },
        },
      },
      // 调整 chunk 大小警告限制
      // pinyin 库本身就很大（6MB），但它是按需加载的，不影响首屏性能
      chunkSizeWarningLimit: 7000,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData',
          '**/*.spec.ts',
        ],
      },
    },
  }
})
