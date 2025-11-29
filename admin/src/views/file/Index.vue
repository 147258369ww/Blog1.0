<template>
  <div class="file-manage">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Upload" @click="showUploadDialog = true">
          上传文件
        </el-button>
        <el-button-group class="view-toggle">
          <el-button
            :type="viewMode === 'grid' ? 'primary' : 'default'"
            :icon="Grid"
            @click="viewMode = 'grid'"
          >
            网格
          </el-button>
          <el-button
            :type="viewMode === 'list' ? 'primary' : 'default'"
            :icon="List"
            @click="viewMode = 'list'"
          >
            列表
          </el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件名..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- 文件网格视图 -->
    <div v-if="viewMode === 'grid'" v-loading="loading" class="file-grid">
      <div v-for="file in fileList" :key="file.id" class="file-card" @click="handleFileClick(file)">
        <div class="file-preview">
          <el-image
            v-if="isImage(file.mime_type)"
            :src="getFileUrl(file.thumbnail_url || file.url)"
            :preview-src-list="[getFileUrl(file.url)]"
            fit="cover"
            class="preview-image"
            @click.stop
          />
          <div v-else class="file-icon-wrapper">
            <el-icon :size="64" class="file-type-icon">
              <Document />
            </el-icon>
            <div class="file-extension">{{ getFileExtension(file.filename) }}</div>
          </div>
        </div>
        <div class="file-info">
          <div class="file-name" :title="file.original_name">
            {{ file.original_name }}
          </div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
        </div>
        <div class="file-actions">
          <el-button
            type="primary"
            size="small"
            :icon="CopyDocument"
            @click.stop="handleCopyUrl(file)"
          >
            复制链接
          </el-button>
          <el-button type="danger" size="small" :icon="Delete" @click.stop="handleDelete(file)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 文件列表视图 -->
    <el-table v-else v-loading="loading" :data="fileList" stripe class="file-table">
      <el-table-column label="文件名" min-width="300">
        <template #default="{ row }">
          <div class="table-file-info">
            <el-image
              v-if="isImage(row.mime_type)"
              :src="getFileUrl(row.thumbnail_url || row.url)"
              :preview-src-list="[getFileUrl(row.url)]"
              fit="cover"
              class="table-thumbnail"
            />
            <el-icon v-else :size="32" class="table-file-icon">
              <Document />
            </el-icon>
            <span class="table-file-name" :title="row.original_name">
              {{ row.original_name }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文件类型" width="150">
        <template #default="{ row }">
          {{ row.mime_type }}
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" :icon="CopyDocument" @click="handleCopyUrl(row)">
            复制链接
          </el-button>
          <el-button
            v-if="isImage(row.mime_type)"
            type="info"
            size="small"
            :icon="View"
            @click="handlePreview(row)"
          >
            预览
          </el-button>
          <el-button type="success" size="small" :icon="Download" @click="handleDownload(row)">
            下载
          </el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文件"
      width="600px"
      :close-on-click-modal="false"
    >
      <FileUpload
        v-model="uploadedFiles"
        :multiple="true"
        :max-size="10"
        accept="*"
        @success="handleUploadSuccess"
      />
      <template #footer>
        <el-button @click="showUploadDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 文件选择器对话框 (供编辑器使用) -->
    <el-dialog
      v-model="showFileSelectorDialog"
      title="选择文件"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="file-selector">
        <el-input
          v-model="selectorSearchKeyword"
          placeholder="搜索文件..."
          :prefix-icon="Search"
          clearable
          style="margin-bottom: 16px"
          @clear="handleSelectorSearch"
          @keyup.enter="handleSelectorSearch"
        />
        <div class="selector-file-grid">
          <div
            v-for="file in selectorFileList"
            :key="file.id"
            class="selector-file-card"
            :class="{ selected: isFileSelected(file) }"
            @click="handleSelectorFileClick(file)"
          >
            <div class="selector-file-preview">
              <el-image
                v-if="isImage(file.mime_type)"
                :src="getFileUrl(file.thumbnail_url || file.url)"
                fit="cover"
                class="selector-preview-image"
              />
              <el-icon v-else :size="48" class="selector-file-icon">
                <Document />
              </el-icon>
            </div>
            <div class="selector-file-name" :title="file.original_name">
              {{ file.original_name }}
            </div>
            <el-icon v-if="isFileSelected(file)" class="selected-icon" :size="24">
              <CircleCheck />
            </el-icon>
          </div>
        </div>
        <div class="selector-pagination">
          <el-pagination
            v-model:current-page="selectorCurrentPage"
            :total="selectorTotal"
            :page-size="20"
            layout="prev, pager, next"
            @current-change="handleSelectorPageChange"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showFileSelectorDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSelection">
          确定 (已选 {{ selectedFiles.length }} 个)
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Grid,
  List,
  Search,
  Document,
  CopyDocument,
  Delete,
  View,
  Download,
  CircleCheck,
} from '@element-plus/icons-vue'
import { fileApi } from '@/api/file'
import type { File } from '@/types/models'
import FileUpload from '@/components/upload/FileUpload.vue'
import { getFullUrl } from '@/utils/url'

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid')

// 搜索关键词
const searchKeyword = ref('')

// 文件列表
const fileList = ref<File[]>([])
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 上传对话框
const showUploadDialog = ref(false)
const uploadedFiles = ref<string[]>([])

// 文件选择器
const showFileSelectorDialog = ref(false)
const selectorSearchKeyword = ref('')
const selectorFileList = ref<File[]>([])
const selectorCurrentPage = ref(1)
const selectorTotal = ref(0)
const selectedFiles = ref<File[]>([])
const selectorMultiple = ref(true)

/**
 * 加载文件列表
 */
const loadFileList = async () => {
  try {
    loading.value = true
    const response = await fileApi.getList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value || undefined,
    })

    fileList.value = response.data || []
    total.value = response.total || 0
  } catch (error) {
    console.error('加载文件列表失败:', error)
    ElMessage.error('加载文件列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索文件
 */
const handleSearch = () => {
  currentPage.value = 1
  loadFileList()
}

/**
 * 分页变化
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFileList()
}

/**
 * 每页数量变化
 */
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadFileList()
}

/**
 * 获取完整的文件 URL
 * 使用统一的 URL 处理服务
 */
const getFileUrl = (url: string): string => {
  return getFullUrl(url)
}

/**
 * 判断是否为图片
 */
const isImage = (mimeType: string): boolean => {
  return Boolean(mimeType && mimeType.startsWith('image/'))
}

/**
 * 获取文件扩展名
 */
const getFileExtension = (filename: string): string => {
  const parts = filename?.split('.') || []
  return parts.length > 1 ? (parts[parts.length - 1] || '').toUpperCase() : 'FILE'
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

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
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 文件点击
 */
const handleFileClick = (file: File) => {
  if (isImage(file.mime_type)) {
    handlePreview(file)
  }
}

/**
 * 复制文件 URL
 */
const handleCopyUrl = async (file: File) => {
  try {
    const fullUrl = getFileUrl(file.url)
    await navigator.clipboard.writeText(fullUrl)
    ElMessage.success('文件链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

/**
 * 预览文件
 */
const handlePreview = (file: File) => {
  window.open(getFileUrl(file.url), '_blank')
}

/**
 * 下载文件
 */
const handleDownload = (file: File) => {
  const link = document.createElement('a')
  link.href = getFileUrl(file.url)
  link.download = file.original_name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 删除文件
 */
const handleDelete = async (file: File) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.original_name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await fileApi.delete(file.id)
    ElMessage.success('文件删除成功')
    loadFileList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error('删除文件失败')
    }
  }
}

/**
 * 上传成功
 */
const handleUploadSuccess = () => {
  loadFileList()
}

/**
 * 打开文件选择器
 */
const openFileSelector = (multiple = true): Promise<File[]> => {
  return new Promise(resolve => {
    selectorMultiple.value = multiple
    selectedFiles.value = []
    selectorSearchKeyword.value = ''
    selectorCurrentPage.value = 1
    showFileSelectorDialog.value = true
    loadSelectorFileList()

    // 保存 resolve 函数以便后续调用
    ;(window as any).__fileSelectorResolve = resolve
  })
}

/**
 * 加载选择器文件列表
 */
const loadSelectorFileList = async () => {
  try {
    const response = await fileApi.getList({
      page: selectorCurrentPage.value,
      limit: 20,
      search: selectorSearchKeyword.value || undefined,
    })

    selectorFileList.value = response.data || []
    selectorTotal.value = response.total || 0
  } catch (error) {
    console.error('加载文件列表失败:', error)
  }
}

/**
 * 选择器搜索
 */
const handleSelectorSearch = () => {
  selectorCurrentPage.value = 1
  loadSelectorFileList()
}

/**
 * 选择器分页变化
 */
const handleSelectorPageChange = (page: number) => {
  selectorCurrentPage.value = page
  loadSelectorFileList()
}

/**
 * 选择器文件点击
 */
const handleSelectorFileClick = (file: File) => {
  if (selectorMultiple.value) {
    const index = selectedFiles.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    } else {
      selectedFiles.value.push(file)
    }
  } else {
    selectedFiles.value = [file]
  }
}

/**
 * 判断文件是否被选中
 */
const isFileSelected = (file: File): boolean => {
  return selectedFiles.value.some(f => f.id === file.id)
}

/**
 * 确认选择
 */
const handleConfirmSelection = () => {
  const resolve = (window as any).__fileSelectorResolve
  if (resolve) {
    resolve(selectedFiles.value)
    delete (window as any).__fileSelectorResolve
  }
  showFileSelectorDialog.value = false
}

// 暴露给外部使用的方法
defineExpose({
  openFileSelector,
})

// 初始化
onMounted(() => {
  loadFileList()
})
</script>

<style scoped lang="scss">
.file-manage {
  padding: 20px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;

      .view-toggle {
        margin-left: 12px;
      }
    }
  }

  // 网格视图
  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;

    .file-card {
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      background-color: var(--el-bg-color);

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .file-preview {
        width: 100%;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--el-fill-color-light);
        position: relative;

        .preview-image {
          width: 100%;
          height: 100%;
        }

        .file-icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          .file-type-icon {
            color: var(--el-color-primary);
          }

          .file-extension {
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-regular);
          }
        }
      }

      .file-info {
        padding: 12px;
        border-top: 1px solid var(--el-border-color-lighter);

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

      .file-actions {
        padding: 12px;
        display: flex;
        gap: 8px;
        border-top: 1px solid var(--el-border-color-lighter);

        .el-button {
          flex: 1;
        }
      }
    }
  }

  // 列表视图
  .file-table {
    margin-bottom: 20px;

    .table-file-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .table-thumbnail {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .table-file-icon {
        color: var(--el-color-primary);
        flex-shrink: 0;
      }

      .table-file-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 分页
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  // 文件选择器
  .file-selector {
    .selector-file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 16px;

      .selector-file-card {
        border: 2px solid var(--el-border-color);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover {
          border-color: var(--el-color-primary);
        }

        &.selected {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        .selector-file-preview {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--el-fill-color-light);

          .selector-preview-image {
            width: 100%;
            height: 100%;
          }

          .selector-file-icon {
            color: var(--el-color-primary);
          }
        }

        .selector-file-name {
          padding: 8px;
          font-size: 12px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .selected-icon {
          position: absolute;
          top: 4px;
          right: 4px;
          color: var(--el-color-primary);
          background-color: white;
          border-radius: 50%;
        }
      }
    }

    .selector-pagination {
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .file-manage {
    padding: 12px;

    .toolbar {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        width: 100%;
      }

      .toolbar-right .el-input {
        width: 100% !important;
      }
    }

    .file-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }
  }
}
</style>
