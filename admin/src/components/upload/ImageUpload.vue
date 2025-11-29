<template>
  <div class="image-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadAction"
      :headers="uploadHeaders"
      :data="uploadData"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :file-list="fileList"
      :list-type="'picture-card'"
      :drag="true"
      :disabled="disabled"
    >
      <template #default>
        <div class="upload-trigger">
          <el-icon class="upload-icon"><Plus /></el-icon>
          <div class="upload-text">点击或拖拽上传图片</div>
          <div class="upload-hint">支持 JPG、PNG、GIF 格式，最大 {{ maxSize }}MB</div>
        </div>
      </template>
      <template #file="{ file }">
        <div class="image-preview">
          <img :src="file.url" :alt="file.name" class="preview-image" />
          <div class="preview-actions">
            <el-icon class="action-icon" @click="handlePreview(file)">
              <ZoomIn />
            </el-icon>
            <el-icon class="action-icon" @click="() => handleRemoveClick(file)">
              <Delete />
            </el-icon>
          </div>
          <el-progress
            v-if="file.status === 'uploading'"
            :percentage="file.percentage || 0"
            :stroke-width="2"
            class="upload-progress"
          />
        </div>
      </template>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <img :src="previewUrl" alt="预览图片" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElUpload } from 'element-plus'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getFullUrl } from '@/utils/url'
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus'

interface Props {
  modelValue?: string | string[]
  multiple?: boolean
  limit?: number
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
  limit: 1,
  maxSize: 5,
  disabled: false,
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const uploadRef = ref<InstanceType<typeof ElUpload>>()
const fileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

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
    fileType: 'image',
  }
})

const accept = 'image/jpeg,image/png,image/gif'

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
      .map((url, index) => ({
        name: `image-${index}`,
        url: getFullUrl(url), // 转换为完整URL
        uid: Date.now() + index,
        status: 'success' as const,
      }))
  },
  { immediate: true }
)

/**
 * 上传前验证
 */
const handleBeforeUpload: UploadProps['beforeUpload'] = file => {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG、GIF 格式的图片')
    return false
  }

  // 验证文件大小
  const maxSizeInBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }

  return true
}

/**
 * 上传成功处理
 */
const handleSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response.success && response.data) {
    // 后端已返回完整 URL，直接使用
    const url = response.data.url

    // 直接更新file对象的url属性
    file.url = url

    // 更新文件列表中的 URL
    const index = fileList.value.findIndex(f => f.uid === file.uid)
    if (index !== -1 && fileList.value[index]) {
      fileList.value[index].url = url
    }

    // 立即发送更新事件
    const emitValue = props.multiple ? [url] : url
    emit('update:modelValue', emitValue)

    // 触发成功事件
    emit('success', file, url)
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

/**
 * 上传失败处理
 */
const handleError: UploadProps['onError'] = error => {
  ElMessage.error('图片上传失败，请重试')
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
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
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
 * 预览图片
 */
const handlePreview = (file: UploadFile) => {
  previewUrl.value = file.url || ''
  previewVisible.value = true
}

/**
 * 更新 modelValue
 */
const updateModelValue = () => {
  const urls = fileList.value.filter(file => file.url).map(file => file.url as string)

  const value = props.multiple ? urls : urls[0] || ''
  emit('update:modelValue', value)
}
</script>

<style scoped lang="scss">
.image-upload {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  :deep(.el-upload-dragger) {
    padding: 0;
    border: none;
    background-color: transparent;
  }

  .upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 148px;
    height: 148px;
    padding: 16px;
    text-align: center;

    .upload-icon {
      font-size: 28px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-bottom: 4px;
    }

    .upload-hint {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }

  .image-preview {
    position: relative;
    width: 100%;
    height: 100%;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s;

      .action-icon {
        font-size: 20px;
        color: #fff;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.2);
        }
      }
    }

    &:hover .preview-actions {
      opacity: 1;
    }

    .upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  :deep(.el-upload-list__item) {
    transition: all 0.3s;
  }

  :deep(.el-upload-list__item.is-uploading) {
    .image-preview {
      opacity: 0.6;
    }
  }
}
</style>
