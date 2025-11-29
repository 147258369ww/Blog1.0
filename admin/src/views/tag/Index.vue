<template>
  <div class="tag-page">
    <el-card class="tag-card">
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建标签
          </el-button>
        </div>
      </template>

      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索标签名称"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="toolbar-actions">
          <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedIds.length }})
          </el-button>
        </div>
      </div>

      <!-- 标签列表 -->
      <el-table
        v-loading="loading"
        :data="tagList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="name" label="标签名称" min-width="150">
          <template #default="{ row }">
            <div class="tag-name-cell">
              <el-tag
                :color="row.color || '#409EFF'"
                :style="{ color: getTextColor(row.color) }"
                effect="plain"
              >
                {{ row.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="slug" label="URL Slug" min-width="150" />

        <el-table-column prop="color" label="颜色" width="120">
          <template #default="{ row }">
            <div class="color-cell">
              <div class="color-preview" :style="{ backgroundColor: row.color || '#409EFF' }" />
              <span>{{ row.color || '#409EFF' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="articleCount" label="文章数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small"> {{ row.articleCount || 0 }} 篇 </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

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

    <!-- 标签表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建标签' : '编辑标签'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入标签名称"
            maxlength="30"
            show-word-limit
            @input="handleNameInput"
          />
        </el-form-item>

        <el-form-item label="URL Slug" prop="slug">
          <el-input v-model="formData.slug" placeholder="自动生成或手动输入" maxlength="50">
            <template #append>
              <el-button @click="generateSlug"> 自动生成 </el-button>
            </template>
          </el-input>
          <div class="form-tip">用于 URL 路径，建议使用英文、数字和连字符</div>
        </el-form-item>

        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="formData.color" show-alpha :predefine="predefineColors" />
          <el-input
            v-model="formData.color"
            placeholder="#409EFF"
            style="width: 200px; margin-left: 10px"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
            maxlength="100"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { tagApi, type TagCreateRequest, type TagUpdateRequest } from '@/api/tag'
import type { Tag } from '@/types/models'

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 对话框状态
type DialogMode = 'create' | 'edit'
const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('create')

// 搜索关键词
const searchKeyword = ref('')

// 标签列表
const tagList = ref<Tag[]>([])

// 选中的标签 ID
const selectedIds = ref<number[]>([])

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<TagCreateRequest & { id?: number }>({
  name: '',
  slug: '',
  color: '#409EFF',
  description: '',
})

// 预定义颜色
const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#00D7FF',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
]

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 30, message: '标签名称长度在 1 到 30 个字符', trigger: 'blur' },
  ],
  slug: [
    { required: true, message: '请输入 URL Slug', trigger: 'blur' },
    {
      pattern: /^[a-z0-9-]+$/,
      message: 'Slug 只能包含小写字母、数字和连字符',
      trigger: 'blur',
    },
  ],
}

/**
 * 获取标签列表
 */
const fetchTagList = async () => {
  loading.value = true
  try {
    const response = await tagApi.getList({
      page: pagination.page,
      limit: pagination.limit,
      search: searchKeyword.value || undefined,
    })

    tagList.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.page = 1
  fetchTagList()
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = () => {
  pagination.page = 1
  fetchTagList()
}

/**
 * 处理页码变化
 */
const handlePageChange = () => {
  fetchTagList()
}

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: Tag[]) => {
  selectedIds.value = selection.map(item => item.id)
}

/**
 * 处理创建标签
 */
const handleCreate = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
  resetForm()
}

/**
 * 处理编辑标签
 */
const handleEdit = (tag: Tag) => {
  dialogMode.value = 'edit'
  dialogVisible.value = true

  formData.id = tag.id
  formData.name = tag.name
  formData.slug = tag.slug
  formData.color = tag.color || '#409EFF'
  formData.description = tag.description || ''

  // 清除验证错误
  formRef.value?.clearValidate()
}

/**
 * 处理删除标签
 */
const handleDelete = (tag: Tag) => {
  // 检查是否有文章使用该标签
  if (tag.articleCount > 0) {
    ElMessageBox.alert(
      `该标签被 ${tag.articleCount} 篇文章使用，无法删除。请先移除文章中的该标签。`,
      '无法删除',
      {
        confirmButtonText: '知道了',
        type: 'warning',
      }
    )
    return
  }

  ElMessageBox.confirm(`确定要删除标签"${tag.name}"吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await tagApi.delete(tag.id)
        ElMessage.success('标签删除成功')
        fetchTagList()
      } catch (error) {
        console.error('删除标签失败:', error)
        ElMessage.error('删除标签失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 处理批量删除
 */
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    return
  }

  // 检查是否有标签被文章使用
  const usedTags = tagList.value.filter(
    tag => selectedIds.value.includes(tag.id) && tag.articleCount > 0
  )

  if (usedTags.length > 0) {
    ElMessageBox.alert(
      `选中的标签中有 ${usedTags.length} 个被文章使用，无法删除。请先移除文章中的这些标签。`,
      '无法删除',
      {
        confirmButtonText: '知道了',
        type: 'warning',
      }
    )
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个标签吗？此操作不可恢复。`,
    '确认批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 逐个删除标签
        await Promise.all(selectedIds.value.map(id => tagApi.delete(id)))

        ElMessage.success('标签批量删除成功')
        selectedIds.value = []
        fetchTagList()
      } catch (error) {
        console.error('批量删除标签失败:', error)
        ElMessage.error('批量删除标签失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 处理标签名称输入，自动生成 slug
 */
const handleNameInput = () => {
  if (!formData.slug || dialogMode.value === 'create') {
    generateSlug()
  }
}

/**
 * 生成 slug
 */
const generateSlug = async () => {
  if (!formData.name) {
    return
  }

  try {
    // 动态导入 pinyin 库（按需加载，减少初始包体积）
    const { default: pinyin } = await import('pinyin')

    // 使用 pinyin 库将中文转换为拼音
    const pinyinArray = pinyin(formData.name, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false,
    })

    // 将拼音数组转换为字符串，并转换为小写，用连字符连接
    formData.slug = pinyinArray
      .flat()
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  } catch (error) {
    // 如果拼音转换失败，使用简单的替换
    formData.slug = formData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
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
        // 创建标签
        const data: TagCreateRequest = {
          name: formData.name,
          slug: formData.slug,
          color: formData.color,
          description: formData.description,
        }

        await tagApi.create(data)
        ElMessage.success('标签创建成功')
      } else {
        // 更新标签
        if (!formData.id) return

        const data: TagUpdateRequest = {
          name: formData.name,
          slug: formData.slug,
          color: formData.color,
          description: formData.description,
        }

        await tagApi.update(formData.id, data)
        ElMessage.success('标签更新成功')
      }

      // 关闭对话框
      dialogVisible.value = false

      // 刷新列表
      fetchTagList()
    } catch (error) {
      console.error('保存标签失败:', error)
      ElMessage.error('保存标签失败')
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
  formData.slug = ''
  formData.color = '#409EFF'
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
 * 根据背景色获取合适的文字颜色
 */
const getTextColor = (bgColor?: string) => {
  if (!bgColor) return '#ffffff'

  // 移除 # 号
  const color = bgColor.replace('#', '')

  // 转换为 RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // 根据亮度返回黑色或白色
  return brightness > 128 ? '#000000' : '#ffffff'
}

/**
 * 初始化
 */
onMounted(() => {
  fetchTagList()
})
</script>

<style scoped lang="scss">
.tag-page {
  padding: 20px;
}

.tag-card {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .toolbar-actions {
    display: flex;
    gap: 10px;
  }
}

.tag-name-cell {
  display: flex;
  align-items: center;

  .el-tag {
    font-weight: 500;
  }
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color);
  }

  span {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
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

// 响应式设计
@media (max-width: 768px) {
  .tag-page {
    padding: 10px;
  }

  .toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;

    .el-input {
      width: 100% !important;
    }

    .toolbar-actions {
      justify-content: flex-end;
    }
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
