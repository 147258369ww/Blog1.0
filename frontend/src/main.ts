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
    const shown = sessionStorage.getItem('intent_shown')
    if (shown) return
    // 先标记已展示，避免并发或重复触发
    sessionStorage.setItem('intent_shown', '1')
    const res = await intentApi.greeting()
    const data = (res as any)?.data ?? res
    const msg = (data && (data.message || data.data?.message)) || '欢迎访问！'
    const toast = useToast()
    toast.info(msg, 5000)
  } catch (_) {}
})
