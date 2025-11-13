<template>
  <nav class="pagination" aria-label="Pagination">
    <!-- Previous button -->
    <button
      class="pagination__button pagination__button--prev"
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
      aria-label="Previous page"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="pagination__button-text">Previous</span>
    </button>

    <!-- Page numbers (desktop) -->
    <div class="pagination__pages" v-if="!isMobile">
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="[
          'pagination__page',
          { 'pagination__page--active': page === currentPage },
          { 'pagination__page--ellipsis': page === '...' }
        ]"
        :disabled="page === '...'"
        @click="page !== '...' && handlePageChange(page as number)"
        :aria-label="`Page ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
      >
        {{ page }}
      </button>
    </div>

    <!-- Page indicator (mobile) -->
    <div class="pagination__indicator" v-else>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
    </div>

    <!-- Next button -->
    <button
      class="pagination__button pagination__button--next"
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
      aria-label="Next page"
    >
      <span class="pagination__button-text">Next</span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

interface Emits {
  (e: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7
})

const emit = defineEmits<Emits>()

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 834
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages, maxVisiblePages } = props

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - 1)
    let end = Math.min(totalPages - 1, currentPage + 1)

    // Adjust range if near boundaries
    if (currentPage <= 3) {
      end = Math.min(maxVisiblePages - 1, totalPages - 1)
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - maxVisiblePages + 2)
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages)
  }

  return pages
})

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 32px 0;
}

.pagination__button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  min-height: 44px;
  background-color: var(--bg-primary, #FFFFFF);
  border: 1px solid var(--color-gray-300, #D0D5DD);
  border-radius: 8px;
  color: var(--text-primary, #1A1A1A);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination__button:hover:not(:disabled) {
  background-color: var(--color-gray-50, #F9FAFB);
  border-color: var(--color-gray-500, #667085);
}

.pagination__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__button svg {
  width: 20px;
  height: 20px;
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination__page {
  min-width: 40px;
  min-height: 40px;
  padding: 8px 12px;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary, #667085);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination__page:hover:not(:disabled):not(.pagination__page--active) {
  background-color: var(--color-gray-50, #F9FAFB);
  color: var(--text-primary, #1A1A1A);
}

.pagination__page--active {
  background-color: var(--color-primary-50, #F9F5FF);
  border-color: var(--color-primary-600, #7F56D9);
  color: var(--color-primary-700, #6941C6);
  font-weight: 600;
}

.pagination__page--ellipsis {
  cursor: default;
  pointer-events: none;
}

.pagination__indicator {
  padding: 8px 16px;
  color: var(--text-secondary, #667085);
  font-size: 14px;
  font-weight: 500;
}

/* Dark theme */
[data-theme="dark"] .pagination__button {
  background-color: var(--bg-secondary, #121212);
  border-color: rgba(255, 255, 255, 0.34);
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .pagination__button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .pagination__page {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .pagination__page:hover:not(:disabled):not(.pagination__page--active) {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .pagination__page--active {
  background-color: rgba(127, 86, 217, 0.2);
  border-color: #7F56D9;
  color: #D6BBFB;
}

/* Mobile responsive */
@media (max-width: 834px) {
  .pagination {
    gap: 12px;
  }

  .pagination__button-text {
    display: none;
  }

  .pagination__button {
    padding: 12px;
    min-width: 44px;
  }
}
</style>
