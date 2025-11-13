import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// Export all stores for convenient access
export { useAuthStore } from './auth'
export { usePostsStore } from './posts'
export { useCategoriesStore } from './categories'
export { useTagsStore } from './tags'
export { useThemeStore } from './theme'
export { useSiteConfigStore } from './siteConfig'
