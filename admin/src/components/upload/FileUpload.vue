<template>
  <div class="file-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadAction"
      :headers="uploadHeaders"
      :data="uploadData"
      :multiple="multiple"
      :accept="accept"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :file-list="fileList"
      :drag="true"
      :disabled="disabled"
      :show-file-list="true"
    >
      <template #default>
        <div class="upload-trigger">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">点击或拖拽文件到此处上传</div>
          <div class="upload-hint">文件大小不超过 {{ maxSize }}MB</div>
        </div>
      </template>
      <template #file="{ file }">
        <div class="file-item">
          <div class="file-info">
            <el-icon class="file-icon">
              <Document />
            </el-icon>
            <div class="file-details">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          <div class="file-actions">
            <el-progress
              v-if="file.status === 'uploading'"
              :percentage="Math.round(file.percentage || 0)"
              :stroke-width="4"
              class="file-progress"
            />
            <el-icon v-if="file.status === 'success'" class="action-icon success-icon">
              <CircleCheck />
            </el-icon>
            <el-icon
              v-if="file.status === 'success'"
              class="action-icon delete-icon"
              @click="() => handleRemoveClick(file)"
            >
              <Delete />
            </el-icon>
          </div>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElUpload } from 'element-plus'
import { UploadFilled, Document, CircleCheck, Delete } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus'

interface Props {
  modelValue?: string | string[]
  multiple?: boolean
  accept?: string
  maxSize?: number
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'success', file: UploadFile, url: string): void
  (e: 'error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: false,
  accept: '*',
  maxSize: 10,
  disabled: false,
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const uploadRef = ref<InstanceType<typeof ElUpload>>()
const fileList = ref<UploadUserFile[]>([])

// 上传配置
const uploadAction = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/admin/files/upload'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${authStore.token}`,
  }
})

const uploadData = computed(() => {
  return {
    fileType: 'file',
  }
})

// 初始化文件列表
watch(
  () => props.modelValue,
  newValue => {
    if (!newValue) {
      fileList.value = []
      return
    }

    const urls = Array.isArray(newValue) ? newValue : [newValue]
    fileList.value = urls
      .filter(url => url)
      .map((url, index) => {
        const fileName = url.split('/').pop() || `file-${index}`
        return {
          name: fileName,
          url: url,
          uid: Date.now() + index,
          status: 'success' as const,
        }
      })
  },
  { immediate: true }
)

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 上传前验证
 */
const handleBeforeUpload: UploadProps['beforeUpload'] = file => {
  // 验证文件大小
  const maxSizeInBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  return true
}

/**
 * 上传成功处理
 */
const handleSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response.success && response.data) {
    const url = response.data.url

    // 更新文件列表中的 URL
    const index = fileList.value.findIndex(f => f.uid === file.uid)
    if (index !== -1 && fileList.value[index]) {
      fileList.value[index].url = url
    }

    // 更新 modelValue
    updateModelValue()

    // 触发成功事件
    emit('success', file, url)
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(response.message || '文件上传失败')
  }
}

/**
 * 上传失败处理
 */
const handleError: UploadProps['onError'] = error => {
  ElMessage.error('文件上传失败，请重试')
  emit('error', error as Error)
}

/**
 * 上传进度处理
 */
const handleProgress: UploadProps['onProgress'] = () => {
  // Element Plus 会自动处理进度显示
}

/**
 * 超出限制处理
 */
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('已达到最大上传数量限制')
}

/**
 * 删除文件处理
 */
const handleRemove: UploadProps['onRemove'] = file => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    updateModelValue()
  }
}

/**
 * 点击删除按钮
 */
const handleRemoveClick = (file: UploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    updateModelValue()
  }
}

/**
 * 更新 modelValue
 */
const updateModelValue = () => {
  const urls = fileList.value
    .filter(file => file.status === 'success' && file.url)
    .map(file => file.url as string)

  if (props.multiple) {
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', urls[0] || '')
  }
}
</script>

<style scoped lang="scss">
.file-upload {
  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px 20px;
    border: 2px dashed var(--el-border-color);
    border-radius: 6px;
    background-color: var(--el-fill-color-blank);
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    .upload-icon {
      font-size: 48px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
    }

    .upload-text {
      font-size: 16px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }

    .upload-hint {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  :deep(.el-upload-list) {
    margin-top: 16px;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    background-color: var(--el-fill-color-blank);
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .file-icon {
        font-size: 32px;
        color: var(--el-color-primary);
        flex-shrink: 0;
      }

      .file-details {
        flex: 1;
        min-width: 0;

        .file-name {
          font-size: 14px;
          color: var(--el-text-color-regular);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .file-size {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .file-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;

      .file-progress {
        width: 120px;
      }

      .action-icon {
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s;

        &.success-icon {
          color: var(--el-color-success);
        }

        &.delete-icon {
          color: var(--el-text-color-secondary);

          &:hover {
            color: var(--el-color-danger);
            transform: scale(1.2);
          }
        }
      }
    }
  }

  :deep(.el-upload-list__item) {
    margin-bottom: 8px;
    padding: 0;
    border: none;
    background: none;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-upload-list__item.is-uploading) {
    .file-item {
      opacity: 0.8;
    }
  }
}
</style>
