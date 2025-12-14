import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useThemeStore } from './stores/theme'
import { logPerformanceMetrics, runWhenIdle } from './utils/performance'
import { errorHandler } from './utils/errorHandler'

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
