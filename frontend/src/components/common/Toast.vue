<template>
  <div class="toast" :class="`toast--${type}`" role="alert" aria-live="polite">
    <div class="toast__icon">
      <svg v-if="type === 'success'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" stroke-width="2"/>
        <path d="M10 6.66667V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 13.3333H10.0084" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="type === 'warning'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 6.66667V10M10 13.3333H10.0084M8.57502 2.92501L1.51669 14.1667C1.37116 14.4187 1.29416 14.7044 1.29334 14.9954C1.29252 15.2864 1.36791 15.5726 1.51204 15.8254C1.65617 16.0783 1.86407 16.2891 2.11549 16.4367C2.36691 16.5843 2.65283 16.6635 2.94419 16.6667H17.0559C17.3472 16.6635 17.6331 16.5843 17.8846 16.4367C18.136 16.2891 18.3439 16.0783 18.488 15.8254C18.6321 15.5726 18.7075 15.2864 18.7067 14.9954C18.7059 14.7044 18.6289 14.4187 18.4834 14.1667L11.425 2.92501C11.2767 2.68056 11.0675 2.47862 10.8171 2.33688C10.5667 2.19514 10.2839 2.11865 9.99585 2.11865C9.70783 2.11865 9.42502 2.19514 9.17464 2.33688C8.92426 2.47862 8.71503 2.68056 8.56669 2.92501H8.57502Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39765 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39765 18.3333 10 18.3333Z" stroke="currentColor" stroke-width="2"/>
        <path d="M10 13.3333V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 6.66667H10.0084" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    
    <div class="toast__content">
      <p class="toast__message">{{ message }}</p>
    </div>
    
    <button 
      class="toast__close" 
      @click="handleClose"
      aria-label="Close notification"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Emits {
  (e: 'close', id: number): void
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000
})

const emit = defineEmits<Emits>()

const handleClose = () => {
  emit('close', props.id)
}
</script>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 420px;
  padding: 16px;
  background-color: var(--bg-primary, #FFFFFF);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-left: 4px solid;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-primary, #1A1A1A);
  word-wrap: break-word;
}

.toast__close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-secondary, #667085);
  cursor: pointer;
  transition: color 0.2s ease;
}

.toast__close:hover {
  color: var(--text-primary, #1A1A1A);
}

/* Type variants */
.toast--success {
  border-left-color: #027A48;
}

.toast--success .toast__icon {
  color: #027A48;
}

.toast--error {
  border-left-color: #C01048;
}

.toast--error .toast__icon {
  color: #C01048;
}

.toast--warning {
  border-left-color: #B54708;
}

.toast--warning .toast__icon {
  color: #B54708;
}

.toast--info {
  border-left-color: #3538CD;
}

.toast--info .toast__icon {
  color: #3538CD;
}

/* Dark theme */
[data-theme="dark"] .toast {
  background-color: var(--bg-secondary, #121212);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .toast__message {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .toast__close {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .toast__close:hover {
  color: var(--text-primary, #FFFFFF);
}

/* Mobile responsive */
@media (max-width: 834px) {
  .toast {
    min-width: 280px;
    max-width: calc(100vw - 32px);
  }
}
</style>
