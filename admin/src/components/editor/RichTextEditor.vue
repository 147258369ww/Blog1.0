<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <div ref="toolbarRef" class="toolbar-container"></div>
      <el-button
        :icon="isFullscreen ? 'Close' : 'FullScreen'"
        circle
        size="small"
        class="fullscreen-btn"
        @click="toggleFullscreen"
      />
    </div>
    <div
      ref="editorRef"
      :class="['editor-container', { 'is-fullscreen': isFullscreen }]"
      :style="{ height: computedHeight }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { uploadApi } from '@/api/upload'
import { getFullImageUrl } from '@/utils/image'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue?: string
  placeholder?: string
  height?: number | string
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: 400,
  readonly: false,
})

const emit = defineEmits<Emits>()

const editorRef = ref<HTMLElement>()
const toolbarRef = ref<HTMLElement>()
const isFullscreen = ref(false)
let quillInstance: Quill | null = null
let isInternalChange = false

const computedHeight = computed(() => {
  if (isFullscreen.value) return '100%'
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

// 工具栏配置
const toolbarOptions = [
  // 标题
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  // 字体大小
  [{ size: ['small', false, 'large', 'huge'] }],
  // 格式化
  ['bold', 'italic', 'underline', 'strike'],
  // 颜色
  [{ color: [] }, { background: [] }],
  // 列表
  [{ list: 'ordered' }, { list: 'bullet' }],
  // 缩进
  [{ indent: '-1' }, { indent: '+1' }],
  // 对齐
  [{ align: [] }],
  // 链接、图片、代码块
  ['link', 'image', 'code-block'],
  // 清除格式
  ['clean'],
]

// 初始化编辑器
const initEditor = () => {
  if (!editorRef.value || !toolbarRef.value) return

  // 先创建工具栏 HTML
  const toolbarContainer = toolbarRef.value
  toolbarContainer.innerHTML = ''

  // 创建工具栏按钮组
  toolbarOptions.forEach(group => {
    const groupDiv = document.createElement('span')
    groupDiv.className = 'ql-formats'

    group.forEach(item => {
      if (typeof item === 'string') {
        // 简单按钮
        const button = document.createElement('button')
        button.className = `ql-${item}`
        button.type = 'button'
        groupDiv.appendChild(button)
      } else if (typeof item === 'object') {
        // 下拉选择
        const entries = Object.entries(item)
        if (entries.length > 0) {
          const entry = entries[0]
          if (entry) {
            const [key, values] = entry
            const select = document.createElement('select')
            select.className = `ql-${key}`

            if (Array.isArray(values)) {
              values.forEach(value => {
                const option = document.createElement('option')
                if (value !== false) {
                  option.value = String(value)
                }
                select.appendChild(option)
              })
            }

            groupDiv.appendChild(select)
          }
        }
      }
    })

    toolbarContainer.appendChild(groupDiv)
  })

  // 然后初始化 Quill
  quillInstance = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: props.placeholder,
    readOnly: props.readonly,
    modules: {
      toolbar: {
        container: toolbarContainer,
        handlers: {
          image: handleImageUpload,
        },
      },
    },
  })

  // 设置初始内容
  if (props.modelValue) {
    isInternalChange = true
    quillInstance.root.innerHTML = props.modelValue
    isInternalChange = false
  }

  // 监听内容变化
  quillInstance.on('text-change', () => {
    if (isInternalChange) return

    const html = quillInstance!.root.innerHTML
    const isEmpty = quillInstance!.getText().trim().length === 0
    const value = isEmpty ? '' : html

    emit('update:modelValue', value)
    emit('change', value)
  })
}

// 处理图片上传
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/png,image/gif'

  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 5MB')
      return
    }

    // 验证文件类型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      ElMessage.error('只支持 JPEG、PNG、GIF 格式的图片')
      return
    }

    try {
      // 显示加载提示
      const loading = ElMessage.info({
        message: '图片上传中...',
        duration: 0,
      })

      // 上传图片
      const response = await uploadApi.uploadFile(file, 'image')

      loading.close()

      if (response.success && response.data) {
        // 获取图片 URL 并转换为完整URL
        const imageUrl = getFullImageUrl(response.data.url || response.data.file?.url)

        if (imageUrl) {
          // 插入图片到编辑器
          const range = quillInstance!.getSelection(true)
          quillInstance!.insertEmbed(range.index, 'image', imageUrl)
          quillInstance!.setSelection(range.index + 1, 0)

          ElMessage.success('图片上传成功')
        } else {
          ElMessage.error('图片上传失败：未获取到图片 URL')
        }
      } else {
        ElMessage.error(response.message || '图片上传失败')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
    }
  }

  input.click()
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (!quillInstance) return

    const currentValue = quillInstance.root.innerHTML
    if (newValue !== currentValue) {
      isInternalChange = true
      quillInstance.root.innerHTML = newValue || ''
      isInternalChange = false
    }
  }
)

// 监听只读状态
watch(
  () => props.readonly,
  newValue => {
    if (quillInstance) {
      quillInstance.enable(!newValue)
    }
  }
)

// 生命周期
onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }

  if (quillInstance) {
    quillInstance = null
  }
})

// 暴露方法
defineExpose({
  getQuill: () => quillInstance,
  focus: () => quillInstance?.focus(),
  blur: () => quillInstance?.blur(),
})
</script>

<style lang="scss" scoped>
.rich-text-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: #fff;

  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color);
    background: var(--el-fill-color-light);

    .toolbar-container {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .fullscreen-btn {
      margin-left: 12px;
      flex-shrink: 0;
    }
  }

  .editor-container {
    position: relative;
    background: #fff;

    &.is-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      height: 100vh !important;

      :deep(.ql-container) {
        height: calc(100vh - 100px) !important;
      }
    }

    :deep(.ql-container) {
      font-size: 14px;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    :deep(.ql-editor) {
      min-height: 200px;
      padding: 16px;
      line-height: 1.6;

      &.ql-blank::before {
        font-style: normal;
        color: var(--el-text-color-placeholder);
      }

      // 标题样式
      h1 {
        font-size: 2em;
        margin: 0.67em 0;
      }
      h2 {
        font-size: 1.5em;
        margin: 0.75em 0;
      }
      h3 {
        font-size: 1.17em;
        margin: 0.83em 0;
      }
      h4 {
        font-size: 1em;
        margin: 1.12em 0;
      }
      h5 {
        font-size: 0.83em;
        margin: 1.5em 0;
      }
      h6 {
        font-size: 0.75em;
        margin: 1.67em 0;
      }

      // 列表样式
      ul,
      ol {
        padding-left: 1.5em;
      }

      // 代码块样式
      pre {
        background: #f5f5f5;
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        margin: 16px 0;
      }

      code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }

      // 图片样式
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 12px 0;
      }

      // 链接样式
      a {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      // 引用样式
      blockquote {
        border-left: 4px solid var(--el-color-primary);
        padding-left: 16px;
        margin: 16px 0;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// Quill 工具栏样式覆盖
:deep(.ql-formats) {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;

  button {
    width: 28px;
    height: 28px;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    &.ql-active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  select {
    height: 28px;
    padding: 0 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &:focus {
      outline: none;
      border-color: var(--el-color-primary);
    }
  }
}

// 全屏模式下的工具栏
.is-fullscreen {
  ~ .editor-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
  }
}
</style>
