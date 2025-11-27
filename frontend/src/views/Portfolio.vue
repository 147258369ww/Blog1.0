<template>
  <div ref="rootRef" class="portfolio">
    <div class="portfolio__cursor"></div>
    <main class="portfolio__main">
      <section class="portfolio__hero container">
        <h1 class="portfolio__hero-title">
          <span class="portfolio__hero-text-inner">Creative</span>
        </h1>
        <h1 class="portfolio__hero-title">
          <span class="portfolio__hero-text-inner">Developer &</span>
        </h1>
        <h1 class="portfolio__hero-title">
          <span class="portfolio__hero-text-inner">Designer.</span>
        </h1>
        <p class="portfolio__hero-subtitle">Creating digital experiences that blend art, code, and human interaction.</p>
        <div class="portfolio__scroll-indicator">SCROLL DOWN ↓</div>
      </section>

      <section class="portfolio__work-section container">
        <h2 class="portfolio__section-title">Selected Works</h2>
        <div class="portfolio__project-list">
          <div
            v-for="(project, idx) in projects"
            :key="project.id"
            class="portfolio__project-item hover-trigger"
            :class="{ 'portfolio__project-item--reverse': (idx + 1) % 2 === 0 }"
          >
            <div class="portfolio__project-info">
              <span class="portfolio__project-num">{{ project.num }}</span>
              <h3 class="portfolio__project-title">{{ project.title }}</h3>
              <p class="portfolio__project-desc">{{ project.desc }}</p>
            </div>
            <div class="portfolio__project-img-wrapper">
              <img :src="project.img" :alt="project.title" class="portfolio__project-img" />
            </div>
          </div>
        </div>
      </section>

      <footer class="portfolio__footer">
        <div class="portfolio__footer-text">Let's work together.</div>
        <a href="mailto:hello@example.com" class="portfolio__btn hover-trigger">Get in Touch</a>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const rootRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)

type Project = { id: number; num: string; title: string; desc: string; img: string }

const projects = ref<Project[]>([
  { id: 1, num: '01 / WEB DESIGN', title: 'Neon Genesis', desc: '一个赛博朋克风格的沉浸式电商网站，使用了 WebGL 技术展示产品细节。', img: 'https://picsum.photos/id/237/800/600' },
  { id: 2, num: '02 / BRANDING', title: 'Abstract Flow', desc: '为现代艺术画廊设计的动态视觉识别系统，强调流动性与静止的结合。', img: 'https://picsum.photos/id/28/800/600' },
  { id: 3, num: '03 / INTERACTION', title: 'Minimalist Arc', desc: '极简主义建筑事务所的官方网站，采用独特的水平滚动交互模式。', img: 'https://picsum.photos/id/16/800/600' }
])

let lenis: any = null
const cleanupFns: (() => void)[] = []

onMounted(async () => {
  await nextTick()

  document.body.classList.add('no-cursor')

  const cursorEl = rootRef.value?.querySelector('.portfolio__cursor') as HTMLElement | null
  if (cursorEl) {
    cursorRef.value = cursorEl
    const moveHandler = (e: MouseEvent) => {
      cursorEl.style.left = e.clientX + 'px'
      cursorEl.style.top = e.clientY + 'px'
    }
    document.addEventListener('mousemove', moveHandler)
    cleanupFns.push(() => document.removeEventListener('mousemove', moveHandler))

    const triggers = rootRef.value?.querySelectorAll('.hover-trigger, a, .portfolio__project-img-wrapper') || []
    triggers.forEach(el => {
      const enter = () => cursorEl.classList.add('active')
      const leave = () => cursorEl.classList.remove('active')
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
      cleanupFns.push(() => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
      })
    })
  }

  const heroLines = rootRef.value?.querySelectorAll('.portfolio__hero-text-inner') || []
  if (heroLines.length) {
    gsap.from(heroLines, { y: '100%', duration: 1.5, stagger: 0.2, ease: 'power4.out', delay: 0.5 })
    const heroExtras = rootRef.value?.querySelectorAll('.portfolio__hero-subtitle, .portfolio__scroll-indicator') || []
    gsap.to(heroExtras, { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' })
  }

  const projectEls = rootRef.value?.querySelectorAll('.portfolio__project-item') || []
  projectEls.forEach((el, i) => {
    const fade = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        id: 'portfolio-project-fade-' + i
      }
    })
    const img = el.querySelector('.portfolio__project-img') as HTMLElement | null
    if (img) {
      gsap.to(img, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          id: 'portfolio-project-parallax-' + i
        }
      })
    }
    cleanupFns.push(() => fade.kill())
  })

  const footerText = rootRef.value?.querySelector('.portfolio__footer-text')
  if (footerText) {
    const footerAnim = gsap.from(footerText, {
      y: 100,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: rootRef.value?.querySelector('.portfolio__footer') || footerText,
        start: 'top 70%',
        id: 'portfolio-footer'
      }
    })
    cleanupFns.push(() => footerAnim.kill())
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2
  })
  const onScrollUpdate = () => ScrollTrigger.update()
  lenis.on('scroll', onScrollUpdate)
  cleanupFns.push(() => lenis.off('scroll', onScrollUpdate))

  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  cleanupFns.push(() => {
    if (lenis) lenis.destroy()
  })
})

onBeforeUnmount(() => {
  document.body.classList.remove('no-cursor')
  cleanupFns.forEach(fn => fn())
  const ids = ['portfolio-footer']
  ids.forEach(id => {
    const st = ScrollTrigger.getById(id)
    if (st) st.kill()
  })
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:wght@400;700&display=swap');

body.no-cursor {
  cursor: none;
}
</style>

<style scoped>
.portfolio {
  --bg-color: #0a0a0a;
  --text-color: #f0f0f0;
  --accent-color: #ff4d4d;
  --cursor-size: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.container {
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.portfolio__cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--cursor-size);
  height: var(--cursor-size);
  border: 1px solid #fff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, background-color 0.3s;
  mix-blend-mode: difference;
}

.portfolio__cursor.active {
  width: 50px;
  height: 50px;
  background-color: #fff;
  opacity: 0.5;
  border: none;
}

.portfolio__hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  position: relative;
}

.portfolio__hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 8vw, 8rem);
  line-height: 1;
  margin-bottom: 20px;
  overflow: hidden;
}

.portfolio__hero-text-inner {
  display: block;
}

.portfolio__hero-subtitle {
  font-size: 1.2rem;
  opacity: 0;
  margin-top: 20px;
  max-width: 600px;
  color: #888;
}

.portfolio__scroll-indicator {
  position: absolute;
  bottom: 50px;
  right: 50px;
  font-size: 0.9rem;
  opacity: 0;
}

.portfolio__work-section {
  padding: 100px 0;
  min-height: 100vh;
  position: relative;
}

.portfolio__section-title {
  font-size: 3rem;
  margin-bottom: 80px;
  border-bottom: 1px solid #333;
  padding-bottom: 20px;
}

.portfolio__project-list {
  display: flex;
  flex-direction: column;
  gap: 150px;
}

.portfolio__project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(100px);
}

.portfolio__project-item--reverse {
  flex-direction: row-reverse;
}

.portfolio__project-info {
  flex: 1;
  padding: 20px;
  min-width: 300px;
}

.portfolio__project-num {
  font-size: 1rem;
  color: var(--accent-color);
  margin-bottom: 10px;
  display: block;
}

.portfolio__project-title {
  font-size: 3rem;
  margin-bottom: 20px;
  font-family: 'Playfair Display', serif;
  cursor: pointer;
  transition: color 0.3s;
}

.portfolio__project-title:hover {
  color: #ccc;
}

.portfolio__project-desc {
  color: #888;
  line-height: 1.6;
}

.portfolio__project-img-wrapper {
  flex: 1.5;
  height: 400px;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
  min-width: 300px;
}

.portfolio__project-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.2);
  transition: transform 0.5s ease;
}

.portfolio__project-img-wrapper:hover .portfolio__project-img {
  transform: scale(1.1);
}

.portfolio__footer {
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #333;
  text-align: center;
}

.portfolio__footer-text {
  font-size: clamp(2rem, 5vw, 5rem);
  font-family: 'Playfair Display', serif;
  margin-bottom: 30px;
}

.portfolio__btn {
  padding: 15px 40px;
  border: 1px solid #fff;
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;
  border-radius: 30px;
  transition: all 0.3s;
}

.portfolio__btn:hover {
  background: #fff;
  color: #000;
}
</style>