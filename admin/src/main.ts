import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { initPerformanceMonitoring } from '@/utils/performance'
import 'element-plus/dist/index.css'
import '@/assets/styles/global.scss'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')

// 移除首屏加载动画
setTimeout(() => {
  document.body.classList.add('app-loaded')
  setTimeout(() => {
    const loadingEl = document.getElementById('app-loading')
    if (loadingEl) {
      loadingEl.remove()
    }
  }, 300)
}, 100)

// 初始化性能监控
initPerformanceMonitoring()
