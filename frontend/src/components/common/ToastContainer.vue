<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-list">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :id="toast.id"
          :message="toast.message"
          :type="toast.type"
          :duration="toast.duration"
          @close="removeToast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Toast from './Toast.vue'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const removeToast = (id: number) => {
  remove(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

/* Transition animations */
.toast-list-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-list-leave-active {
  animation: slideOut 0.3s ease;
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

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Mobile responsive */
@media (max-width: 834px) {
  .toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
    align-items: stretch;
  }
}
</style>
