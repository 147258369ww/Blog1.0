<template>
  <div class="tag-cloud">
    <button
      v-for="tag in displayTags"
      :key="tag.id"
      :class="['tag-cloud__item', { 'tag-cloud__item--active': isActive(tag.id) }]"
      :style="getTagStyle(tag)"
      @click="handleTagClick(tag)"
    >
      {{ tag.name }}
      <span class="tag-cloud__count">({{ tag.postCount }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Tag } from '@/types/models'

interface Props {
  tags: Tag[]
  maxTags?: number
  activeTagId?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxTags: 30
})

const emit = defineEmits<{
  tagClick: [tag: Tag]
}>()

const router = useRouter()

// Display limited number of tags
const displayTags = computed(() => 
  props.tags.slice(0, props.maxTags)
)

// Calculate min and max post counts for sizing
const postCounts = computed(() => 
  props.tags.map(tag => tag.postCount)
)

const minCount = computed(() => 
  Math.min(...postCounts.value)
)

const maxCount = computed(() => 
  Math.max(...postCounts.value)
)

// Calculate font size based on post count
const getFontSize = (count: number): number => {
  if (maxCount.value === minCount.value) {
    return 14 // Default size if all counts are the same
  }
  
  // Scale between 12px and 24px
  const minSize = 12
  const maxSize = 24
  const ratio = (count - minCount.value) / (maxCount.value - minCount.value)
  return minSize + ratio * (maxSize - minSize)
}

// Get dynamic style for each tag
const getTagStyle = (tag: Tag) => {
  const fontSize = getFontSize(tag.postCount)
  const color = tag.color || '#7F56D9'
  
  // Convert hex to RGB for alpha transparency
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16)
    } : { r: 127, g: 86, b: 217 }
  }
  
  const rgb = hexToRgb(color)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  
  return {
    fontSize: `${fontSize}px`,
    '--tag-bg': isDark 
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` 
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    '--tag-color': color,
    '--tag-hover-bg': isDark
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
  }
}

// Check if tag is active
const isActive = (tagId: number): boolean => {
  return props.activeTagId === tagId
}

// Handle tag click
const handleTagClick = (tag: Tag) => {
  emit('tagClick', tag)
  router.push(`/tags/${tag.id}`)
}
</script>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
}

.tag-cloud__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 20px;
  border: none;
  background-color: var(--tag-bg);
  color: var(--tag-color);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tag-cloud__item:hover {
  background-color: var(--tag-hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-cloud__item:active {
  transform: translateY(0);
}

.tag-cloud__item--active {
  background-color: var(--tag-color) !important;
  color: #FFFFFF !important;
}

.tag-cloud__item--active .tag-cloud__count {
  color: rgba(255, 255, 255, 0.8);
}

.tag-cloud__count {
  font-size: 0.85em;
  opacity: 0.7;
  font-weight: 400;
}

/* Focus state for accessibility */
.tag-cloud__item:focus {
  outline: 2px solid var(--tag-color);
  outline-offset: 2px;
}

/* Dark theme adjustments */
[data-theme="dark"] .tag-cloud__item:hover {
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

/* Responsive - Tablet */
@media (max-width: 834px) {
  .tag-cloud {
    gap: 10px;
  }

  .tag-cloud__item {
    padding: 5px 12px;
    font-size: 0.9em !important; /* Scale down all tags proportionally */
  }
}

/* Responsive - Mobile */
@media (max-width: 390px) {
  .tag-cloud {
    gap: 8px;
    justify-content: center;
  }

  .tag-cloud__item {
    padding: 4px 10px;
    font-size: 0.85em !important; /* Scale down all tags proportionally */
  }

  .tag-cloud__count {
    font-size: 0.8em;
  }
}

/* Grid layout option */
.tag-cloud--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.tag-cloud--grid .tag-cloud__item {
  justify-content: center;
}

@media (max-width: 834px) {
  .tag-cloud--grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
}

@media (max-width: 390px) {
  .tag-cloud--grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
}
</style>
