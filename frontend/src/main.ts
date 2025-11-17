import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useThemeStore } from './stores/theme'
import { logPerformanceMetrics, runWhenIdle } from './utils/performance'
import { errorHandler } from './utils/errorHandler'
import { intentApi } from './services/api/intent'
import { useToast } from './composables/useToast'

const app = createApp(App)

app.use(pinia)
app.use(router)

// 安装全局错误处理器
errorHandler.install(app)

// 初始化主题系统
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')

// 性能监控 (在空闲时执行)
runWhenIdle(() => {
  logPerformanceMetrics()
})

runWhenIdle(async () => {
  try {
    const key = 'intent_greeting_cache'
    const raw = localStorage.getItem(key)
    const now = Date.now()
    const ttl = 600 * 1000
    let msg: string | null = null
    if (raw) {
      try {
        const cached = JSON.parse(raw)
        if (cached && typeof cached.message === 'string' && typeof cached.ts === 'number') {
          if (now - cached.ts < ttl) {
            msg = cached.message
          }
        }
      } catch {}
    }
    if (!msg) {
      const res = await intentApi.greeting()
      const data = (res as any)?.data ?? res
      msg = (data && (data.message || data.data?.message)) || '欢迎访问！'
      try {
        const intent = (data && (data.intent || data.data?.intent)) || null
        localStorage.setItem(key, JSON.stringify({ message: msg, intent, ts: now }))
      } catch {}
    }
    const toast = useToast()
    const finalMsg = msg || '欢迎访问！'
    toast.info(finalMsg, 5000)
  } catch (_) {}
})
