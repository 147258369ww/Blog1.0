<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__content">
        <!-- 版权信息 -->
        <div class="footer__copyright">
          <p class="footer__text">
            {{ copyrightText }}
          </p>
        </div>

        <!-- 社交媒体链接 -->
        <div class="footer__social">
          <a
            v-for="link in socialLinks"
            :key="link.name"
            :href="link.url"
            :aria-label="link.label"
            class="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <component :is="link.icon" class="footer__social-icon" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

interface SocialLink {
  name: string
  url: string
  label: string
  icon: any
}

interface FooterProps {
  copyright?: string
  socialMedia?: {
    twitter?: string
    linkedin?: string
    email?: string
    rss?: string
    feedly?: string
  }
}

const props = withDefaults(defineProps<FooterProps>(), {
  copyright: '',
  socialMedia: () => ({})
})

const copyrightText = computed(() => {
  const year = new Date().getFullYear()
  return props.copyright || `© ${year} 个人博客. 保留所有权利.`
})

// 社交媒体图标组件
const TwitterIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
  })
])

const LinkedInIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
  })
])

const EmailIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
  h('polyline', { points: '22,6 12,13 2,6' })
])

const RSSIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368C10.58 4.858 19.152 13.406 19.183 24h4.817C23.97 9.686 14.302.024 0 0v4.812z'
  })
])

const FeedlyIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M12.003 23.274l-9.092-9.092c-1.218-1.218-1.218-3.194 0-4.412l9.092-9.092c.607-.607 1.59-.607 2.197 0l9.092 9.092c1.218 1.218 1.218 3.194 0 4.412l-9.092 9.092c-.607.607-1.59.607-2.197 0zm-1.098-7.274l1.098 1.098 1.098-1.098-1.098-1.098-1.098 1.098zm0-3.294l1.098 1.098 1.098-1.098-1.098-1.098-1.098 1.098zm0-3.294l1.098 1.098 1.098-1.098-1.098-1.098-1.098 1.098z'
  })
])

const socialLinks = computed<SocialLink[]>(() => {
  const links: SocialLink[] = []
  
  if (props.socialMedia?.twitter) {
    links.push({
      name: 'twitter',
      url: props.socialMedia.twitter,
      label: 'Follow us on Twitter',
      icon: TwitterIcon
    })
  }
  
  if (props.socialMedia?.linkedin) {
    links.push({
      name: 'linkedin',
      url: props.socialMedia.linkedin,
      label: 'Connect on LinkedIn',
      icon: LinkedInIcon
    })
  }
  
  if (props.socialMedia?.email) {
    links.push({
      name: 'email',
      url: `mailto:${props.socialMedia.email}`,
      label: 'Send us an email',
      icon: EmailIcon
    })
  }
  
  if (props.socialMedia?.rss) {
    links.push({
      name: 'rss',
      url: props.socialMedia.rss,
      label: 'Subscribe to RSS feed',
      icon: RSSIcon
    })
  }
  
  if (props.socialMedia?.feedly) {
    links.push({
      name: 'feedly',
      url: props.socialMedia.feedly,
      label: 'Follow on Feedly',
      icon: FeedlyIcon
    })
  }
  
  return links
})
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: var(--bg-secondary, #F9FAFB);
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  margin-top: auto;
}

.footer__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.footer__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.footer__copyright {
  text-align: center;
}

.footer__text {
  margin: 0;
  color: var(--text-secondary, #667085);
  font-size: 0.875rem;
  line-height: 1.5;
}

.footer__social {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer__social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0.625rem;
  color: var(--text-secondary, #667085);
  background: transparent;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.footer__social-link:hover {
  color: var(--color-primary-600, #7F56D9);
  background-color: var(--bg-primary, #FFFFFF);
}

.footer__social-link:focus-visible {
  outline: 2px solid var(--color-primary-600, #7F56D9);
  outline-offset: 2px;
}

.footer__social-icon {
  width: 20px;
  height: 20px;
}

/* 平板端和桌面端 - 水平布局 */
@media (min-width: 835px) {
  .footer__content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .footer__copyright {
    text-align: left;
  }
}

/* 移动端优化 */
@media (max-width: 390px) {
  .footer__container {
    padding: 1.5rem 1rem;
  }

  .footer__social {
    gap: 0.5rem;
  }

  .footer__text {
    font-size: 0.8125rem;
  }
}

/* Dark theme support */
[data-theme='dark'] .footer {
  background-color: var(--bg-secondary, #121212);
  border-top-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .footer__text {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme='dark'] .footer__social-link {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme='dark'] .footer__social-link:hover {
  color: var(--color-primary-600, #7F56D9);
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
