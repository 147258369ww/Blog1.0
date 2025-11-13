<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-screen">
      <!-- Dome Gallery 背景动画 -->
      <div class="dome-container">
        <DomeGallery
          :images="loadingImages"
          :fit="0.7"
          fit-basis="min"
          :min-radius="300"
          :max-radius="600"
          :segments="20"
          :drag-sensitivity="30"
          :enlarge-transition-ms="300"
          :grayscale="true"
          overlay-blur-color="#0a0a0a"
          image-border-radius="15px"
        />
      </div>

      <!-- 顶部标题区域 -->
      <div class="top-section">
        <h1 class="loading-title">THE BLOG</h1>
      </div>

      <!-- 底部进度条区域 -->
      <div class="bottom-section">
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import DomeGallery from './DomeGallery.vue'

const isLoading = ref(true)
const progress = ref(0)

// 加载动画使用的图片 - 使用 picsum.photos 作为可靠的图片源
const loadingImages = [
  'https://picsum.photos/300/300?random=1',
  'https://picsum.photos/300/300?random=2',
  'https://picsum.photos/300/300?random=3',
  'https://picsum.photos/300/300?random=4',
  'https://picsum.photos/300/300?random=5',
  'https://picsum.photos/300/300?random=6',
  'https://picsum.photos/300/300?random=7',
]

// 真实的资源加载跟踪（最少4秒）
const trackRealProgress = () => {
  const startTime = performance.now()
  const minLoadTime = 4000 // 最少加载4秒
  let animationFrame: number
  let isPageLoaded = false

  const updateProgress = () => {
    const elapsed = performance.now() - startTime
    
    // 基于时间和资源加载状态计算进度
    let calculatedProgress = 0
    
    // 前800ms快速到20%
    if (elapsed < 800) {
      calculatedProgress = (elapsed / 800) * 20
    }
    // 800ms-2000ms到50%
    else if (elapsed < 2000) {
      calculatedProgress = 20 + ((elapsed - 800) / 1200) * 30
    }
    // 2000ms-3500ms到80%
    else if (elapsed < 3500) {
      calculatedProgress = 50 + ((elapsed - 2000) / 1500) * 30
    }
    // 3500ms-4000ms到95%
    else if (elapsed < minLoadTime) {
      calculatedProgress = 80 + ((elapsed - 3500) / 500) * 15
    }
    // 4秒后，如果页面已加载，快速到100%
    else if (isPageLoaded) {
      calculatedProgress = 95 + Math.min(((elapsed - minLoadTime) / 300) * 5, 5)
    }
    // 否则保持在95%
    else {
      calculatedProgress = 95
    }

    // 检查文档加载状态
    if (document.readyState === 'complete') {
      isPageLoaded = true
      if (elapsed >= minLoadTime) {
        calculatedProgress = Math.max(calculatedProgress, 95)
      }
    } else if (document.readyState === 'interactive') {
      calculatedProgress = Math.max(calculatedProgress, Math.min(70, calculatedProgress))
    }

    progress.value = Math.min(Math.round(calculatedProgress), 100)

    // 如果还没到100%，继续更新
    if (progress.value < 100) {
      animationFrame = requestAnimationFrame(updateProgress)
    }
  }

  animationFrame = requestAnimationFrame(updateProgress)

  // 监听页面完全加载
  const handleLoad = () => {
    isPageLoaded = true
    const elapsed = performance.now() - startTime
    
    // 如果已经超过最小加载时间，快速完成到100%
    if (elapsed >= minLoadTime) {
      setTimeout(() => {
        progress.value = 100
      }, 300)
    }
  }

  if (document.readyState === 'complete') {
    handleLoad()
  } else {
    window.addEventListener('load', handleLoad, { once: true })
  }

  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }
}

// 监听进度到100%时隐藏加载屏幕
watch(progress, (newProgress) => {
  if (newProgress >= 100) {
    setTimeout(() => {
      isLoading.value = false
    }, 600) // 让用户看到100%
  }
})

onMounted(() => {
  console.log('LoadingScreen mounted')
  trackRealProgress()

  // 确保最终会隐藏（安全措施 - 最多8秒）
  setTimeout(() => {
    if (isLoading.value) {
      console.log('Force completing loading after 8s')
      progress.value = 100
    }
  }, 8000)
})

// 暴露给父组件的方法
defineExpose({
  isLoading,
  progress
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: all;
}

.dome-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 80vh;
  max-width: 1200px;
  max-height: 800px;
  opacity: 0.4;
  z-index: 1;
}

.top-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  text-align: center;
  color: white;
  padding: 3rem 2rem;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.7) 50%, transparent 100%);
}

.loading-title {
  font-size: 4rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.2em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse 2s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
}

.bottom-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  text-align: center;
  color: white;
  padding: 3rem 2rem;
  pointer-events: none;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.7) 50%, transparent 100%);
}

.progress-container {
  width: 500px;
  max-width: 90vw;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.6);
}

.progress-text {
  font-size: 1rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .top-section {
    padding: 2rem 1.5rem;
  }

  .loading-title {
    font-size: 2.5rem;
    letter-spacing: 0.15em;
  }

  .bottom-section {
    padding: 2rem 1.5rem;
  }

  .progress-bar {
    height: 5px;
  }

  .progress-text {
    font-size: 0.9rem;
  }
}
</style>
