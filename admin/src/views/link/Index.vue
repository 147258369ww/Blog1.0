<template>
  <div class="link-page">
    <el-card class="link-card">
      <template #header>
        <div class="card-header">
          <span>友情链接管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建链接
          </el-button>
        </div>
      </template>

      <!-- 链接列表 -->
      <el-table v-loading="loading" :data="linkList" style="width: 100%" row-key="id">
        <el-table-column width="60" align="center">
          <template #default>
            <el-icon class="drag-handle" style="cursor: move; font-size: 18px">
              <Rank />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="链接名称" min-width="150" />

        <el-table-column prop="url" label="链接 URL" min-width="250">
          <template #default="{ row }">
            <el-link :href="row.url" target="_blank" type="primary">
              {{ row.url }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="logo" label="Logo" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.logo"
              :src="row.logo"
              fit="contain"
              style="width: 40px; height: 40px"
              :preview-src-list="[row.logo]"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <span v-else class="no-logo">无</span>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

        <el-table-column prop="sort" label="排序" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row.sort }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 链接表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建链接' : '编辑链接'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="链接名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入链接名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="链接 URL" prop="url">
          <el-input v-model="formData.url" placeholder="https://example.com" maxlength="500" />
          <div class="form-tip">
            请输入完整的 URL 地址，必须包括 http:// 或 https://（例如：https://example.com）
          </div>
        </el-form-item>

        <el-form-item label="Logo URL" prop="logo">
          <el-input
            v-model="formData.logo"
            placeholder="https://example.com/logo.png (可选)"
            maxlength="200"
          >
            <template #append>
              <el-button @click="showImageUpload = true">
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </template>
          </el-input>
          <div v-if="formData.logo" class="logo-preview">
            <el-image :src="formData.logo" fit="contain" style="width: 80px; height: 80px">
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <div>加载失败</div>
                </div>
              </template>
            </el-image>
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入链接描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片上传对话框 -->
    <el-dialog v-model="showImageUpload" title="上传 Logo" width="500px">
      <ImageUpload v-model="formData.logo" :limit="1" @success="showImageUpload = false" />
      <template #footer>
        <el-button @click="showImageUpload = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Rank, Picture, Upload } from '@element-plus/icons-vue'
import { linkApi, type LinkCreateRequest, type LinkUpdateRequest } from '@/api/link'
import type { Link } from '@/types/models'
import ImageUpload from '@/components/upload/ImageUpload.vue'
import Sortable from 'sortablejs'

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 对话框状态
type DialogMode = 'create' | 'edit'
const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('create')

// 图片上传对话框
const showImageUpload = ref(false)

// 链接列表
const linkList = ref<Link[]>([])

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<LinkCreateRequest & { id?: number }>({
  name: '',
  url: '',
  logo: '',
  description: '',
})

// URL 验证函数
const validateUrl = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入链接 URL'))
    return
  }

  try {
    const url = new URL(value)
    // 确保协议是 http 或 https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      callback(new Error('URL 必须以 http:// 或 https:// 开头'))
      return
    }
    // 确保有主机名
    if (!url.hostname) {
      callback(new Error('请输入有效的域名'))
      return
    }
    callback()
  } catch (error) {
    callback(new Error('请输入有效的 URL 地址（例如：https://example.com）'))
  }
}

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入链接名称', trigger: 'blur' },
    { min: 1, max: 50, message: '链接名称长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '请输入链接 URL', trigger: 'blur' },
    { validator: validateUrl, trigger: 'blur' },
  ],
}

// Sortable 实例
let sortableInstance: Sortable | null = null

/**
 * 获取链接列表
 */
const fetchLinkList = async () => {
  loading.value = true
  try {
    const response = await linkApi.getList({
      page: pagination.page,
      limit: pagination.limit,
    })

    linkList.value = response.data || []
    pagination.total = response.total || 0

    // 重新初始化拖拽排序
    await nextTick()
    initSortable()
  } catch (error) {
    console.error('获取链接列表失败:', error)
    ElMessage.error('获取链接列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 初始化拖拽排序
 */
const initSortable = () => {
  // 销毁旧实例
  if (sortableInstance) {
    sortableInstance.destroy()
  }

  const tableBody = document.querySelector('.link-card .el-table__body-wrapper tbody')
  if (!tableBody) return

  sortableInstance = Sortable.create(tableBody as any, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: async evt => {
      const { oldIndex, newIndex } = evt

      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
        return
      }

      // 更新本地列表顺序
      const movedItem = linkList.value.splice(oldIndex, 1)[0]
      if (!movedItem) return
      linkList.value.splice(newIndex, 0, movedItem)

      // 更新排序值
      const sortUpdates = linkList.value.map((link, index) => ({
        id: link.id,
        sort: index + 1,
      }))

      try {
        await linkApi.updateSort(sortUpdates)
        ElMessage.success('排序更新成功')

        // 刷新列表以获取最新数据
        fetchLinkList()
      } catch (error) {
        console.error('更新排序失败:', error)
        ElMessage.error('更新排序失败')

        // 恢复原来的顺序
        fetchLinkList()
      }
    },
  })
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = () => {
  pagination.page = 1
  fetchLinkList()
}

/**
 * 处理页码变化
 */
const handlePageChange = () => {
  fetchLinkList()
}

/**
 * 处理创建链接
 */
const handleCreate = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
  resetForm()
}

/**
 * 处理编辑链接
 */
const handleEdit = (link: Link) => {
  dialogMode.value = 'edit'
  dialogVisible.value = true

  formData.id = link.id
  formData.name = link.name
  formData.url = link.url
  formData.logo = link.logo || ''
  formData.description = link.description || ''

  // 清除验证错误
  formRef.value?.clearValidate()
}

/**
 * 处理删除链接
 */
const handleDelete = (link: Link) => {
  ElMessageBox.confirm(`确定要删除链接"${link.name}"吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await linkApi.delete(link.id)
        ElMessage.success('链接删除成功')
        fetchLinkList()
      } catch (error) {
        console.error('删除链接失败:', error)
        ElMessage.error('删除链接失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return

    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        // 创建链接
        const data: LinkCreateRequest = {
          name: formData.name,
          url: formData.url,
          logo: formData.logo || undefined,
          description: formData.description || undefined,
        }

        await linkApi.create(data)
        ElMessage.success('链接创建成功')
      } else {
        // 更新链接
        if (!formData.id) return

        const data: LinkUpdateRequest = {
          name: formData.name,
          url: formData.url,
          logo: formData.logo || undefined,
          description: formData.description || undefined,
        }

        await linkApi.update(formData.id, data)
        ElMessage.success('链接更新成功')
      }

      // 关闭对话框
      dialogVisible.value = false

      // 刷新列表
      fetchLinkList()
    } catch (error) {
      console.error('保存链接失败:', error)
      ElMessage.error('保存链接失败')
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
  formData.id = undefined
  formData.name = ''
  formData.url = ''
  formData.logo = ''
  formData.description = ''
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 初始化
 */
onMounted(() => {
  fetchLinkList()
})
</script>

<style scoped lang="scss">
.link-page {
  padding: 20px;
}

.link-card {
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drag-handle {
  color: var(--el-text-color-secondary);
  transition: color 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;

  .el-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

.no-logo {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.logo-preview {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  display: inline-block;
}

// 响应式设计
@media (max-width: 768px) {
  .link-page {
    padding: 10px;
  }

  :deep(.el-table) {
    font-size: 12px;

    .el-button {
      padding: 4px 8px;
      font-size: 12px;
    }
  }

  .pagination {
    :deep(.el-pagination) {
      justify-content: center;

      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}
</style>
