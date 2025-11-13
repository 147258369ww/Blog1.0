<template>
  <div class="mobile-demo">
    <h2 class="mobile-demo__title">移动端优化示例</h2>

    <!-- 触摸手势示例 -->
    <section class="mobile-demo__section">
      <h3 class="mobile-demo__subtitle">触摸手势识别</h3>
      <div
        class="mobile-demo__swipe-area"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <p>在此区域滑动</p>
        <p v-if="direction" class="mobile-demo__direction">
          检测到: {{ directionText }}
        </p>
      </div>
    </section>

    <!-- 触摸目标尺寸示例 -->
    <section class="mobile-demo__section">
      <h3 class="mobile-demo__subtitle">触摸目标尺寸 (≥ 44px)</h3>
      <div class="mobile-demo__buttons">
        <button class="mobile-demo__button">标准按钮</button>
        <button class="mobile-demo__button mobile-demo__button--icon" aria-label="图标按钮">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </section>

    <!-- 长按手势示例 -->
    <section class="mobile-demo__section">
      <h3 class="mobile-demo__subtitle">长按手势</h3>
      <div
        class="mobile-demo__long-press"
        @touchstart="longPressHandlers.onTouchStart"
        @touchend="longPressHandlers.onTouchEnd"
        @touchmove="longPressHandlers.onTouchMove"
        @touchcancel="longPressHandlers.onTouchCancel"
      >
        <p>长按此区域 (500ms)</p>
        <p v-if="longPressTriggered" class="mobile-demo__triggered">长按已触发!</p>
      </div>
    </section>

    <!-- 设备检测示例 -->
    <section class="mobile-demo__section">
      <h3 class="mobile-demo__subtitle">设备检测</h3>
      <ul class="mobile-demo__list">
        <li>移动设备: {{ deviceInfo.isMobile ? '是' : '否' }}</li>
        <li>iOS: {{ deviceInfo.isIOS ? '是' : '否' }}</li>
        <li>Android: {{ deviceInfo.isAndroid ? '是' : '否' }}</li>
        <li>触摸设备: {{ deviceInfo.isTouchDevice ? '是' : '否' }}</li>
        <li>屏幕尺寸: {{ deviceInfo.screenSize }}</li>
      </ul>
    </section>

    <!-- 触摸反馈示例 -->
    <section class="mobile-demo__section">
      <h3 class="mobile-demo__subtitle">触摸反馈</h3>
      <button ref="feedbackButtonRef" class="mobile-demo__feedback-button">
        触摸我查看反馈效果
      </button>
    </section>

    <!-- 表单输入示例 -->
    <section class="mobile-demo__section">
      <h3 class="mobile-demo__subtitle">表单输入 (防止 iOS 缩放)</h3>
      <div class="mobile-demo__form">
        <input
          type="text"
          placeholder="文本输入 (16px 字体)"
          class="mobile-demo__input"
        />
        <input
          type="email"
          placeholder="邮箱输入"
          class="mobile-demo__input"
        />
        <textarea
          placeholder="文本域"
          class="mobile-demo__textarea"
          rows="3"
        ></textarea>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTouch } from '@/composables/useTouch'
import {
  useDeviceDetection,
  useTouchFeedback,
  useLongPress
} from '@/composables/useMobileOptimization'

// 触摸手势
const { direction, onTouchStart, onTouchEnd } = useTouch()

const directionText = computed(() => {
  const directionMap = {
    left: '向左滑动 ←',
    right: '向右滑动 →',
    up: '向上滑动 ↑',
    down: '向下滑动 ↓'
  }
  return direction.value ? directionMap[direction.value] : ''
})

// 设备检测
const deviceInfo = useDeviceDetection()

// 触摸反馈
const feedbackButtonRef = ref<HTMLElement | null>(null)
useTouchFeedback(feedbackButtonRef)

// 长按手势
const longPressTriggered = ref(false)
const longPressHandlers = useLongPress(() => {
  longPressTriggered.value = true
  setTimeout(() => {
    longPressTriggered.value = false
  }, 2000)
}, { duration: 500 })
</script>

<style scoped>
.mobile-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.mobile-demo__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.mobile-demo__section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.mobile-demo__subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.mobile-demo__swipe-area {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  user-select: none;
}

.mobile-demo__direction {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary-600);
}

.mobile-demo__buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.mobile-demo__button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-demo__button:active {
  opacity: 0.7;
  transform: scale(0.98);
}

.mobile-demo__button--icon {
  padding: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-demo__button--icon svg {
  width: 24px;
  height: 24px;
}

.mobile-demo__long-press {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  user-select: none;
}

.mobile-demo__triggered {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-success-600);
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.mobile-demo__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-demo__list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.mobile-demo__list li:last-child {
  border-bottom: none;
}

.mobile-demo__feedback-button {
  width: 100%;
  min-height: 48px;
  padding: 1rem;
  background-color: var(--color-info-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-demo__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-demo__input,
.mobile-demo__textarea {
  width: 100%;
  min-height: 48px;
  padding: 0.75rem 1rem;
  font-size: 16px; /* 防止 iOS 缩放 */
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.mobile-demo__input:focus,
.mobile-demo__textarea:focus {
  outline: none;
  border-color: var(--color-primary-600);
}

.mobile-demo__textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

/* 移动端优化 */
@media (max-width: 834px) {
  .mobile-demo {
    padding: 1rem;
  }

  .mobile-demo__title {
    font-size: 1.5rem;
  }

  .mobile-demo__section {
    padding: 1rem;
  }

  .mobile-demo__subtitle {
    font-size: 1.125rem;
  }
}
</style>
