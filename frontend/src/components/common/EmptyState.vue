<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
          <path d="M32 20V32M32 44H32.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </slot>
    </div>
    
    <div class="empty-state__content">
      <h3 v-if="title" class="empty-state__title">{{ title }}</h3>
      <p v-if="description" class="empty-state__description">{{ description }}</p>
      
      <slot name="content"></slot>
    </div>
    
    <div v-if="$slots.action || actionText" class="empty-state__action">
      <slot name="action">
        <button 
          v-if="actionText"
          class="empty-state__button"
          @click="handleAction"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  actionText?: string
}

interface Emits {
  (e: 'action'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  min-height: 400px;
}

.empty-state__icon {
  margin-bottom: 24px;
  color: var(--color-gray-300, #D0D5DD);
}

.empty-state__icon svg {
  width: 64px;
  height: 64px;
}

.empty-state__content {
  max-width: 480px;
  margin-bottom: 24px;
}

.empty-state__title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 30px;
  color: var(--text-primary, #1A1A1A);
}

.empty-state__description {
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary, #667085);
}

.empty-state__action {
  margin-top: 8px;
}

.empty-state__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 18px;
  background-color: var(--color-primary-600, #7F56D9);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-state__button:hover {
  background-color: var(--color-primary-700, #6941C6);
}

.empty-state__button:active {
  transform: scale(0.98);
}

/* Dark theme */
[data-theme="dark"] .empty-state__icon {
  color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .empty-state__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .empty-state__description {
  color: var(--text-secondary, #C0C5D0);
}

/* Mobile responsive */
@media (max-width: 834px) {
  .empty-state {
    padding: 32px 16px;
    min-height: 300px;
  }
  
  .empty-state__icon svg {
    width: 48px;
    height: 48px;
  }
  
  .empty-state__title {
    font-size: 18px;
    line-height: 28px;
  }
  
  .empty-state__description {
    font-size: 14px;
    line-height: 20px;
  }
  
  .empty-state__button {
    font-size: 14px;
    padding: 10px 16px;
  }
}
</style>
