<template>
  <div class="category-page">
    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建分类
          </el-button>
        </div>
      </template>

      <div class="category-content">
        <!-- 左侧：分类树形列表 -->
        <div class="category-tree-section">
          <div class="tree-header">
            <h3>分类列表</h3>
            <el-tooltip content="拖拽分类可调整排序" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>

          <el-scrollbar height="calc(100vh - 280px)">
            <el-tree
              v-loading="loading"
              :data="categoryTree"
              :props="treeProps"
              node-key="id"
              default-expand-all
              draggable
              :allow-drop="allowDrop"
              :allow-drag="allowDrag"
              @node-drop="handleNodeDrop"
              @node-click="handleNodeClick"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <div class="node-content">
                    <span class="node-label">{{ data.name }}</span>
                    <el-tag size="small" type="info" class="article-count">
                      {{ data.articleCount || 0 }} 篇
                    </el-tag>
                  </div>
                  <div class="node-actions">
                    <el-button size="small" text @click.stop="handleAddChild(data)">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <el-button size="small" text @click.stop="handleEdit(data)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button size="small" text type="danger" @click.stop="handleDelete(data)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>

        <!-- 右侧：分类表单 -->
        <div class="category-form-section">
          <div class="form-header">
            <h3>{{ formMode === 'create' ? '新建分类' : '编辑分类' }}</h3>
            <el-button v-if="formMode === 'edit'" text @click="handleCancelEdit">
              取消编辑
            </el-button>
          </div>

          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
            label-position="top"
          >
            <el-form-item label="分类名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入分类名称"
                maxlength="50"
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

            <el-form-item label="父分类" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="parentCategoryOptions"
                :props="treeSelectProps"
                placeholder="选择父分类（可选）"
                clearable
                check-strictly
                :render-after-expand="false"
              />
              <div class="form-tip">不选择则为顶级分类</div>
            </el-form-item>

            <el-form-item label="描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入分类描述"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="排序权重" prop="sort">
              <el-input-number
                v-model="formData.sort"
                :min="0"
                :max="9999"
                controls-position="right"
              />
              <div class="form-tip">数值越大越靠前，默认为 0</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleSubmit">
                {{ formMode === 'create' ? '创建分类' : '保存修改' }}
              </el-button>
              <el-button @click="handleReset"> 重置 </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import { categoryApi, type CategoryCreateRequest, type CategoryUpdateRequest } from '@/api/category'
import type { Category } from '@/types/models'

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 表单模式
type FormMode = 'create' | 'edit'
const formMode = ref<FormMode>('create')

// 分类树数据
const categoryTree = ref<Category[]>([])

// 当前编辑的分类
const currentCategory = ref<Category | null>(null)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<CategoryCreateRequest & { id?: number }>({
  name: '',
  slug: '',
  parentId: undefined,
  description: '',
  sort: 0,
})

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name',
}

// 树形选择器配置
const treeSelectProps = {
  children: 'children',
  label: 'name',
  value: 'id',
  disabled: (data: Category) => {
    // 编辑时，不能选择自己和自己的子分类作为父分类
    if (formMode.value === 'edit' && currentCategory.value) {
      return data.id === currentCategory.value.id || isDescendant(data, currentCategory.value.id)
    }
    return false
  },
}

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' },
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
 * 父分类选项（排除当前编辑的分类及其子分类）
 */
const parentCategoryOptions = computed(() => {
  if (formMode.value === 'edit' && currentCategory.value) {
    return filterCategories(categoryTree.value, currentCategory.value.id)
  }
  return categoryTree.value
})

/**
 * 过滤分类树，排除指定分类及其子分类
 */
function filterCategories(categories: Category[], excludeId: number): Category[] {
  return categories
    .filter(cat => cat.id !== excludeId)
    .map(cat => ({
      ...cat,
      children: cat.children ? filterCategories(cat.children, excludeId) : [],
    }))
}

/**
 * 判断是否为子孙分类
 */
function isDescendant(category: Category, ancestorId: number): boolean {
  if (!category.children || category.children.length === 0) {
    return false
  }

  for (const child of category.children) {
    if (child.id === ancestorId || isDescendant(child, ancestorId)) {
      return true
    }
  }

  return false
}

/**
 * 获取分类树
 */
const fetchCategoryTree = async () => {
  loading.value = true
  try {
    const response = await categoryApi.getTree()
    categoryTree.value = response.data || []
  } catch (error) {
    console.error('获取分类树失败:', error)
    ElMessage.error('获取分类树失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理分类名称输入，自动生成 slug
 */
const handleNameInput = () => {
  if (!formData.slug || formMode.value === 'create') {
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
 * 处理节点点击
 */
const handleNodeClick = (data: Category) => {
  handleEdit(data)
}

/**
 * 处理创建分类
 */
const handleCreate = () => {
  formMode.value = 'create'
  currentCategory.value = null
  handleReset()
}

/**
 * 处理添加子分类
 */
const handleAddChild = (parent: Category) => {
  formMode.value = 'create'
  currentCategory.value = null
  handleReset()
  formData.parentId = parent.id
}

/**
 * 处理编辑分类
 */
const handleEdit = (category: Category) => {
  formMode.value = 'edit'
  currentCategory.value = category

  formData.id = category.id
  formData.name = category.name
  formData.slug = category.slug
  formData.parentId = category.parentId
  formData.description = category.description || ''
  formData.sort = category.sort

  // 清除验证错误
  formRef.value?.clearValidate()
}

/**
 * 处理取消编辑
 */
const handleCancelEdit = () => {
  formMode.value = 'create'
  currentCategory.value = null
  handleReset()
}

/**
 * 处理删除分类
 */
const handleDelete = (category: Category) => {
  // 检查是否有文章
  if (category.articleCount > 0) {
    ElMessageBox.alert(
      `该分类下有 ${category.articleCount} 篇文章，无法删除。请先将文章移动到其他分类。`,
      '无法删除',
      {
        confirmButtonText: '知道了',
        type: 'warning',
      }
    )
    return
  }

  // 检查是否有子分类
  if (category.children && category.children.length > 0) {
    ElMessageBox.alert('该分类下有子分类，无法删除。请先删除或移动子分类。', '无法删除', {
      confirmButtonText: '知道了',
      type: 'warning',
    })
    return
  }

  ElMessageBox.confirm(`确定要删除分类"${category.name}"吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await categoryApi.delete(category.id)
        ElMessage.success('分类删除成功')

        // 如果删除的是当前编辑的分类，重置表单
        if (currentCategory.value?.id === category.id) {
          handleCancelEdit()
        }

        fetchCategoryTree()
      } catch (error) {
        console.error('删除分类失败:', error)
        ElMessage.error('删除分类失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 允许拖拽
 */
const allowDrag = () => {
  return true
}

/**
 * 允许放置
 */
const allowDrop = () => {
  // 允许所有拖拽操作
  return true
}

/**
 * 处理节点拖拽
 */
const handleNodeDrop = async (draggingNode: any) => {
  try {
    // 收集所有需要更新的分类排序信息
    const updates: Array<{ id: number; sort: number; parentId?: number }> = []

    // 构建更新数据
    const collectUpdates = (nodes: any[], parentId?: number) => {
      nodes.forEach((node, index) => {
        const category = node.data as Category
        updates.push({
          id: category.id,
          sort: index,
          parentId: parentId,
        })

        if (node.childNodes && node.childNodes.length > 0) {
          collectUpdates(node.childNodes, category.id)
        }
      })
    }

    // 从根节点开始收集
    const tree = (draggingNode as any).parent
    if (tree && tree.childNodes) {
      collectUpdates(tree.childNodes)
    }

    // 调用 API 更新排序
    await categoryApi.updateSort(updates.map(u => ({ id: u.id, sort: u.sort })))

    ElMessage.success('分类排序更新成功')
    fetchCategoryTree()
  } catch (error) {
    console.error('更新分类排序失败:', error)
    ElMessage.error('更新分类排序失败')
    // 刷新树以恢复原始状态
    fetchCategoryTree()
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
      if (formMode.value === 'create') {
        // 创建分类
        const data: CategoryCreateRequest = {
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId,
          description: formData.description,
          sort: formData.sort,
        }

        await categoryApi.create(data)
        ElMessage.success('分类创建成功')
      } else {
        // 更新分类
        if (!formData.id) return

        const data: CategoryUpdateRequest = {
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId,
          description: formData.description,
          sort: formData.sort,
        }

        await categoryApi.update(formData.id, data)
        ElMessage.success('分类更新成功')
      }

      // 刷新分类树
      await fetchCategoryTree()

      // 重置表单
      if (formMode.value === 'create') {
        handleReset()
      }
    } catch (error) {
      console.error('保存分类失败:', error)
      ElMessage.error('保存分类失败')
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 重置表单
 */
const handleReset = () => {
  formRef.value?.resetFields()
  formData.id = undefined
  formData.name = ''
  formData.slug = ''
  formData.parentId = undefined
  formData.description = ''
  formData.sort = 0
}

/**
 * 初始化
 */
onMounted(() => {
  fetchCategoryTree()
})
</script>

<style scoped lang="scss">
.category-page {
  padding: 20px;
}

.category-card {
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

.category-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  min-height: calc(100vh - 280px);
}

// 左侧分类树
.category-tree-section {
  border-right: 1px solid var(--el-border-color-light);
  padding-right: 30px;

  .tree-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .el-icon {
      color: var(--el-text-color-secondary);
      cursor: help;
    }
  }

  :deep(.el-tree) {
    .el-tree-node__content {
      height: auto;
      padding: 8px 0;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    .is-current > .el-tree-node__content {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 10px;

  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .node-icon {
      font-size: 16px;
      color: var(--el-text-color-secondary);
    }

    .node-label {
      font-size: 14px;
    }

    .article-count {
      margin-left: 8px;
    }
  }

  .node-actions {
    display: none;
    gap: 4px;
  }

  &:hover .node-actions {
    display: flex;
  }
}

// 右侧表单
.category-form-section {
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .category-content {
    grid-template-columns: 1fr;

    .category-tree-section {
      border-right: none;
      border-bottom: 1px solid var(--el-border-color-light);
      padding-right: 0;
      padding-bottom: 30px;
    }
  }
}

@media (max-width: 768px) {
  .category-page {
    padding: 10px;
  }

  .category-content {
    gap: 20px;
  }

  .tree-node {
    .node-actions {
      display: flex;
    }
  }
}
</style>
