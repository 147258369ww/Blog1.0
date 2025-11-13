<template>
  <div
    ref="rootRef"
    class="dome-gallery-root"
    :style="{
      '--segments-x': segments,
      '--segments-y': segments,
      '--overlay-blur-color': overlayBlurColor,
      '--tile-radius': imageBorderRadius,
      '--enlarge-radius': openedImageBorderRadius,
      '--image-filter': grayscale ? 'grayscale(1)' : 'none',
      '--radius': '520px',
      '--viewer-pad': '72px',
      '--circ': 'calc(var(--radius) * 3.14)',
      '--rot-y': 'calc((360deg / var(--segments-x)) / 2)',
      '--rot-x': 'calc((360deg / var(--segments-y)) / 2)',
      '--item-width': 'calc(var(--circ) / var(--segments-x))',
      '--item-height': 'calc(var(--circ) / var(--segments-y))'
    }"
  >
    <main 
      ref="mainRef" 
      style="position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; touch-action: none; user-select: none; background: transparent;"
    >
      <div
        style="width: 100%; height: 100%; display: grid; place-items: center;"
        :style="{
          perspective: 'calc(var(--radius) * 2)',
          perspectiveOrigin: '50% 50%'
        }"
      >
        <div
          ref="sphereRef"
          style="will-change: transform; transform-style: preserve-3d; transform: translateZ(calc(var(--radius) * -1));"
        >
          <div
            v-for="(item, i) in items"
            :key="`${item.x},${item.y},${i}`"
            style="position: absolute; top: -999px; bottom: -999px; left: -999px; right: -999px; margin: auto; transition: transform 300ms;"
            :data-src="item.src"
            :data-offset-x="item.x"
            :data-offset-y="item.y"
            :data-size-x="item.sizeX"
            :data-size-y="item.sizeY"
            :style="{
              '--offset-x': item.x,
              '--offset-y': item.y,
              '--item-size-x': item.sizeX,
              '--item-size-y': item.sizeY,
              width: 'calc(var(--item-width) * var(--item-size-x))',
              height: 'calc(var(--item-height) * var(--item-size-y))',
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 50%',
              backfaceVisibility: 'hidden',
              transform: `rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) translateZ(var(--radius))`
            }"
          >
            <div
              style="position: absolute; display: block; inset: 10px; background: transparent; overflow: hidden; transition: transform 300ms; cursor: pointer; pointer-events: auto; transform: translateZ(0);"
              role="button"
              tabindex="0"
              :aria-label="item.alt || 'Image'"
              :style="{
                borderRadius: 'var(--tile-radius, 12px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                WebkitTransform: 'translateZ(0)'
              }"
            >
              <img
                :src="item.src"
                draggable="false"
                :alt="item.alt"
                style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"
                :style="{
                  backfaceVisibility: 'hidden',
                  filter: 'var(--image-filter, none)'
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        style="position: absolute; inset: 0; margin: auto; z-index: 3; pointer-events: none;"
        :style="{
          backgroundImage: 'radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, #060010) 100%)'
        }"
      />
      <div
        style="position: absolute; inset: 0; margin: auto; z-index: 3; pointer-events: none; backdrop-filter: blur(3px);"
        :style="{
          WebkitMaskImage: 'radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, #060010) 90%)',
          maskImage: 'radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, #060010) 90%)'
        }"
      />
      <div
        style="position: absolute; left: 0; right: 0; height: 120px; z-index: 5; pointer-events: none; top: 0; transform: rotate(180deg);"
        :style="{
          background: 'linear-gradient(to bottom, transparent, var(--overlay-blur-color, #060010))'
        }"
      />
      <div
        style="position: absolute; left: 0; right: 0; height: 120px; z-index: 5; pointer-events: none; bottom: 0;"
        :style="{
          background: 'linear-gradient(to bottom, transparent, var(--overlay-blur-color, #060010))'
        }"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'

interface ImageItem {
  src: string
  alt?: string
}

interface DomeGalleryProps {
  images?: (string | ImageItem)[]
  fit?: number
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height'
  minRadius?: number
  maxRadius?: number
  padFactor?: number
  overlayBlurColor?: string
  maxVerticalRotationDeg?: number
  dragSensitivity?: number
  enlargeTransitionMs?: number
  segments?: number
  dragDampening?: number
  openedImageWidth?: string
  openedImageHeight?: string
  imageBorderRadius?: string
  openedImageBorderRadius?: string
  grayscale?: boolean
}

const DEFAULT_IMAGES: ImageItem[] = [
  { src: 'https://picsum.photos/300/300?random=10', alt: 'Image 1' },
  { src: 'https://picsum.photos/300/300?random=11', alt: 'Image 2' },
  { src: 'https://picsum.photos/300/300?random=12', alt: 'Image 3' },
  { src: 'https://picsum.photos/300/300?random=13', alt: 'Image 4' },
  { src: 'https://picsum.photos/300/300?random=14', alt: 'Image 5' },
]

const AUTO_ROTATE_SPEED_DEG_PER_MS = 0.008

const props = withDefaults(defineProps<DomeGalleryProps>(), {
  fit: 0.6,
  fitBasis: 'auto',
  minRadius: 400,
  maxRadius: 800,
  padFactor: 0.25,
  overlayBlurColor: '#060010',
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 25,
  dragDampening: 2,
  openedImageWidth: '400px',
  openedImageHeight: '400px',
  imageBorderRadius: '20px',
  openedImageBorderRadius: '20px',
  grayscale: true
})

const imagesSource = computed(() => props.images || DEFAULT_IMAGES)

// Template refs
const rootRef = ref<HTMLDivElement>()
const mainRef = ref<HTMLElement>()
const sphereRef = ref<HTMLDivElement>()

// State refs
const rotation = ref({ x: 0, y: 0 })
const startRotation = ref({ x: 0, y: 0 })
const startPosition = ref<{ x: number; y: number } | null>(null)
const isDragging = ref(false)
const hasMoved = ref(false)

let resizeObserver: ResizeObserver | null = null
let autoRotateAnimationFrame: number | null = null
let lastAutoRotateTime = 0

// Utility functions
const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max)
const wrapAngleSigned = (deg: number): number => {
  const a = (((deg + 180) % 360) + 360) % 360
  return a - 180
}

// Build items function
function buildItems(pool: (string | ImageItem)[], seg: number) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2)
  const evenYs = [-4, -2, 0, 2, 4]
  const oddYs = [-3, -1, 1, 3, 5]

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }))
  })

  const totalSlots = coords.length
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }))
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, alt: '' }
    }
    return { src: image.src || '', alt: image.alt || '' }
  })

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length])

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i]?.src || '',
    alt: usedImages[i]?.alt || ''
  }))
}

const items = computed(() => buildItems(imagesSource.value, props.segments))

// Apply transform
const applyTransform = (xDeg: number, yDeg: number) => {
  const el = sphereRef.value
  if (el) {
    el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`
  }
}

const stopAutoRotate = () => {
  if (autoRotateAnimationFrame) {
    cancelAnimationFrame(autoRotateAnimationFrame)
    autoRotateAnimationFrame = null
  }
  lastAutoRotateTime = 0
}

const autoRotateStep = (now: number) => {
  if (!lastAutoRotateTime) {
    lastAutoRotateTime = now
  }
  const deltaMs = now - lastAutoRotateTime
  lastAutoRotateTime = now

  const canSpin = !isDragging.value

  if (canSpin && deltaMs > 0) {
    const nextY = wrapAngleSigned(rotation.value.y + deltaMs * AUTO_ROTATE_SPEED_DEG_PER_MS)
    if (nextY !== rotation.value.y) {
      rotation.value = { x: rotation.value.x, y: nextY }
    }
  }

  autoRotateAnimationFrame = requestAnimationFrame(autoRotateStep)
}

const startAutoRotate = () => {
  if (autoRotateAnimationFrame !== null) return
  lastAutoRotateTime = 0
  autoRotateAnimationFrame = requestAnimationFrame(autoRotateStep)
}

// Gesture handling
const onDragStart = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  hasMoved.value = false
  startRotation.value = { ...rotation.value }

  const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
  startPosition.value = { x: clientX || 0, y: clientY || 0 }
}

const onDragMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !startPosition.value) return

  const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY

  if (clientX === undefined || clientY === undefined) return

  const dxTotal = clientX - startPosition.value.x
  const dyTotal = clientY - startPosition.value.y

  if (!hasMoved.value) {
    const dist2 = dxTotal * dxTotal + dyTotal * dyTotal
    if (dist2 > 16) hasMoved.value = true
  }

  const nextX = clamp(
    startRotation.value.x - dyTotal / props.dragSensitivity,
    -props.maxVerticalRotationDeg,
    props.maxVerticalRotationDeg
  )
  const nextY = wrapAngleSigned(startRotation.value.y + dxTotal / props.dragSensitivity)

  if (rotation.value.x !== nextX || rotation.value.y !== nextY) {
    rotation.value = { x: nextX, y: nextY }
    applyTransform(nextX, nextY)
  }
}

const onDragEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  hasMoved.value = false
}

// Watch for rotation changes and apply transform
watch(rotation, (newRotation) => {
  applyTransform(newRotation.x, newRotation.y)
}, { deep: true })

onMounted(() => {
  applyTransform(rotation.value.x, rotation.value.y)
  startAutoRotate()

  const root = rootRef.value
  const main = mainRef.value
  if (!root || !main) return

  resizeObserver = new ResizeObserver(entries => {
    const cr = entries[0]?.contentRect
    if (!cr) return
    const w = Math.max(1, cr.width)
    const h = Math.max(1, cr.height)
    const minDim = Math.min(w, h)
    const aspect = w / h

    let basis: number
    switch (props.fitBasis) {
      case 'min':
        basis = minDim
        break
      case 'max':
        basis = Math.max(w, h)
        break
      case 'width':
        basis = w
        break
      case 'height':
        basis = h
        break
      default:
        basis = aspect >= 1.3 ? w : minDim
    }

    let radius = basis * props.fit
    const heightGuard = h * 1.35
    radius = Math.min(radius, heightGuard)
    radius = clamp(radius, props.minRadius, props.maxRadius)

    const viewerPad = Math.max(8, Math.round(minDim * props.padFactor))
    const roundedRadius = Math.round(radius)

    root.style.setProperty('--radius', `${roundedRadius}px`)
    root.style.setProperty('--viewer-pad', `${viewerPad}px`)
  })

  resizeObserver.observe(root)

  main.addEventListener('mousedown', onDragStart, { passive: true })
  main.addEventListener('touchstart', onDragStart, { passive: true })

  window.addEventListener('mousemove', onDragMove, { passive: true })
  window.addEventListener('touchmove', onDragMove, { passive: true })

  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchend', onDragEnd)
})

onUnmounted(() => {
  stopAutoRotate()
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  const main = mainRef.value

  if (main) {
    main.removeEventListener('mousedown', onDragStart)
    main.removeEventListener('touchstart', onDragStart)
  }

  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('touchmove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchend', onDragEnd)
})
</script>


<style scoped>
.dome-gallery-root {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.dome-gallery-root * {
  box-sizing: border-box;
}
</style>
