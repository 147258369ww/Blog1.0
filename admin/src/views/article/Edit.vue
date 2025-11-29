<template>
  <div class="article-edit-page">
    <el-card v-loading="loading" class="article-form-card">
      <template #header>
        <div class="card-header">
          <span>编辑文章</span>
          <div class="header-actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="info" :loading="saving" @click="handleSaveDraft"> 保存草稿 </el-button>
            <el-button type="primary" :loading="saving" @click="handlePublish"> 发布 </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="0"
        class="article-form"
      >
        <div class="form-layout">
          <!-- 左侧主要内容区域 -->
          <div class="main-content">
            <!-- 标题输入框 -->
            <el-form-item prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入文章标题"
                size="large"
                maxlength="200"
                show-word-limit
                class="title-input"
              />
            </el-form-item>

            <!-- 富文本编辑器 -->
            <el-form-item prop="content">
              <RichTextEditor
                v-model="formData.content"
                placeholder="请输入文章内容..."
                :height="600"
              />
            </el-form-item>
          </div>

          <!-- 右侧元数据区域 -->
          <div class="metadata-sidebar">
            <!-- 封面图上传 -->
            <el-card shadow="never" class="metadata-card">
              <template #header>
                <span class="card-title">封面图</span>
              </template>
              <el-form-item prop="coverImage">
                <ImageUpload v-model="formData.coverImage" :limit="1" :max-size="5" />
              </el-form-item>
            </el-card>

            <!-- 分类选择 -->
            <el-card shadow="never" class="metadata-card">
              <template #header>
                <div class="card-header-with-action">
                  <span class="card-title">分类 <span class="required">*</span></span>
                  <el-button
                    text
                    size="small"
                    type="primary"
                    @click="showCreateCategoryDialog = true"
                  >
                    + 新建
                  </el-button>
                </div>
              </template>
              <el-form-item prop="categoryId">
                <el-select
                  v-model="formData.categoryId"
                  placeholder="请选择分类"
                  style="width: 100%"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="category in categories.filter(c => c.id !== 0)"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>
            </el-card>

            <!-- 标签选择 -->
            <el-card shadow="never" class="metadata-card">
              <template #header>
                <div class="card-header-with-action">
                  <span class="card-title">标签</span>
                  <el-button text size="small" type="primary" @click="showCreateTagDialog = true">
                    + 新建
                  </el-button>
                </div>
              </template>
              <el-form-item prop="tagIds">
                <el-select
                  v-model="formData.tagIds"
                  placeholder="请选择标签"
                  style="width: 100%"
                  multiple
                  filterable
                  clearable
                >
                  <el-option
                    v-for="tag in tags.filter(t => t.id !== 0)"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.id"
                  />
                </el-select>
              </el-form-item>
            </el-card>

            <!-- 状态选择 -->
            <el-card shadow="never" class="metadata-card">
              <template #header>
                <span class="card-title">状态</span>
              </template>
              <el-form-item prop="status">
                <el-radio-group v-model="formData.status">
                  <el-radio label="draft">草稿</el-radio>
                  <el-radio label="published">已发布</el-radio>
                  <el-radio label="archived">已归档</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-card>

            <!-- 发布时间 -->
            <el-card shadow="never" class="metadata-card">
              <template #header>
                <span class="card-title">发布时间</span>
              </template>
              <el-form-item prop="publishedAt">
                <el-date-picker
                  v-model="formData.publishedAt"
                  type="datetime"
                  placeholder="选择发布时间"
                  style="width: 100%"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-card>

            <!-- SEO 设置 -->
            <el-card shadow="never" class="metadata-card">
              <template #header>
                <div class="card-header-with-collapse">
                  <span class="card-title">SEO 设置</span>
                  <el-button text size="small" @click="seoCollapsed = !seoCollapsed">
                    {{ seoCollapsed ? '展开' : '收起' }}
                  </el-button>
                </div>
              </template>
              <el-collapse-transition>
                <div v-show="!seoCollapsed">
                  <el-form-item label="SEO 标题" prop="seoTitle">
                    <el-input
                      v-model="formData.seoTitle"
                      placeholder="SEO 标题（留空则使用文章标题）"
                      maxlength="60"
                      show-word-limit
                    />
                  </el-form-item>
                  <el-form-item label="SEO 描述" prop="seoDescription">
                    <el-input
                      v-model="formData.seoDescription"
                      type="textarea"
                      placeholder="SEO 描述"
                      maxlength="160"
                      show-word-limit
                      :rows="3"
                    />
                  </el-form-item>
                  <el-form-item label="SEO 关键词" prop="seoKeywords">
                    <el-input
                      v-model="formData.seoKeywords"
                      placeholder="SEO 关键词（用逗号分隔）"
                    />
                  </el-form-item>
                </div>
              </el-collapse-transition>
            </el-card>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 新建分类对话框 -->
    <el-dialog v-model="showCreateCategoryDialog" title="新建分类" width="500px">
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryFormRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="categoryForm.name"
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类别名" prop="slug">
          <el-input
            v-model="categoryForm.slug"
            placeholder="请输入分类别名（URL标识）"
            maxlength="50"
            show-word-limit
          />
          <template #extra>
            <span style="font-size: 12px; color: var(--el-text-color-secondary)">
              用于 URL，如：technology、life 等
            </span>
          </template>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            placeholder="请输入分类描述"
            maxlength="200"
            show-word-limit
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateCategoryDialog = false">取消</el-button>
        <el-button type="primary" :loading="creatingCategory" @click="handleCreateCategory">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 新建标签对话框 -->
    <el-dialog v-model="showCreateTagDialog" title="新建标签" width="500px">
      <el-form ref="tagFormRef" :model="tagForm" :rules="tagFormRules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="tagForm.name"
            placeholder="请输入标签名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签别名" prop="slug">
          <el-input
            v-model="tagForm.slug"
            placeholder="请输入标签别名（URL标识）"
            maxlength="50"
            show-word-limit
          />
          <template #extra>
            <span style="font-size: 12px; color: var(--el-text-color-secondary)">
              用于 URL，如：javascript、vue 等
            </span>
          </template>
        </el-form-item>
        <el-form-item label="标签描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            placeholder="请输入标签描述"
            maxlength="200"
            show-word-limit
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateTagDialog = false">取消</el-button>
        <el-button type="primary" :loading="creatingTag" @click="handleCreateTag"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { articleApi, type ArticleUpdateRequest, type ArticleStatus } from '@/api/article'
import { categoryApi } from '@/api/category'
import { tagApi } from '@/api/tag'
import type { Category, Tag } from '@/types/models'
import RichTextEditor from '@/components/editor/RichTextEditor.vue'
import ImageUpload from '@/components/upload/ImageUpload.vue'

const router = useRouter()
const route = useRoute()

// 文章 ID
const articleId = ref<number>(Number(route.params.id))

// 表单引用
const formRef = ref<FormInstance>()

// 新建分类对话框
const showCreateCategoryDialog = ref(false)
const creatingCategory = ref(false)
const categoryFormRef = ref<FormInstance>()
const categoryForm = reactive({
  name: '',
  slug: '',
  description: '',
})

// 分类表单验证规则
const categoryFormRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  slug: [
    { required: true, message: '请输入分类别名', trigger: 'blur' },
    { min: 1, max: 50, message: '分类别名长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '分类别名只能包含小写字母、数字和连字符', trigger: 'blur' },
  ],
}

// 新建标签对话框
const showCreateTagDialog = ref(false)
const creatingTag = ref(false)
const tagFormRef = ref<FormInstance>()
const tagForm = reactive({
  name: '',
  slug: '',
  description: '',
})

// 标签表单验证规则
const tagFormRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '标签名称长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  slug: [
    { required: true, message: '请输入标签别名', trigger: 'blur' },
    { min: 1, max: 50, message: '标签别名长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '标签别名只能包含小写字母、数字和连字符', trigger: 'blur' },
  ],
}

// 加载状态
const loading = ref(false)

// 保存状态
const saving = ref(false)

// SEO 折叠状态
const seoCollapsed = ref(true)

// 分类列表
const categories = ref<Category[]>([])

// 标签列表
const tags = ref<Tag[]>([])

// 表单数据
const formData = reactive<ArticleUpdateRequest & { tagIds?: number[] }>({
  title: '',
  content: '',
  coverImage: '',
  categoryId: undefined as any,
  tagIds: [],
  status: 'draft',
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' },
  ],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  seoTitle: [{ max: 60, message: 'SEO 标题最多 60 个字符', trigger: 'blur' }],
  seoDescription: [{ max: 160, message: 'SEO 描述最多 160 个字符', trigger: 'blur' }],
}

/**
 * 获取分类列表
 */
const fetchCategories = async () => {
  try {
    const response = await categoryApi.getList()
    categories.value = response.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

/**
 * 获取标签列表
 */
const fetchTags = async () => {
  try {
    const response = await tagApi.getList()
    tags.value = response.data || []
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  }
}

/**
 * 处理创建分类
 */
const handleCreateCategory = async () => {
  if (!categoryFormRef.value) return

  try {
    await categoryFormRef.value.validate()
  } catch (error) {
    return
  }

  creatingCategory.value = true
  try {
    const response = await categoryApi.create({
      name: categoryForm.name,
      slug: categoryForm.slug,
      description: categoryForm.description,
    })

    if (response.success && response.data) {
      ElMessage.success('分类创建成功')
      showCreateCategoryDialog.value = false

      // 重置表单
      categoryForm.name = ''
      categoryForm.slug = ''
      categoryForm.description = ''
      categoryFormRef.value?.resetFields()

      // 刷新分类列表
      await fetchCategories()

      // 自动选中新创建的分类
      formData.categoryId = response.data.id
    } else {
      ElMessage.error(response.message || '创建分类失败')
    }
  } catch (error) {
    console.error('创建分类失败:', error)
    ElMessage.error('创建分类失败')
  } finally {
    creatingCategory.value = false
  }
}

/**
 * 处理创建标签
 */
const handleCreateTag = async () => {
  if (!tagFormRef.value) return

  try {
    await tagFormRef.value.validate()
  } catch (error) {
    return
  }

  creatingTag.value = true
  try {
    const response = await tagApi.create({
      name: tagForm.name,
      slug: tagForm.slug,
      description: tagForm.description,
    })

    if (response.success && response.data) {
      ElMessage.success('标签创建成功')
      showCreateTagDialog.value = false

      // 重置表单
      tagForm.name = ''
      tagForm.slug = ''
      tagForm.description = ''
      tagFormRef.value?.resetFields()

      // 刷新标签列表
      await fetchTags()

      // 自动选中新创建的标签
      if (!formData.tagIds) {
        formData.tagIds = []
      }
      formData.tagIds.push(response.data.id)
    } else {
      ElMessage.error(response.message || '创建标签失败')
    }
  } catch (error) {
    console.error('创建标签失败:', error)
    ElMessage.error('创建标签失败')
  } finally {
    creatingTag.value = false
  }
}

/**
 * 获取文章详情
 */
const fetchArticle = async () => {
  loading.value = true
  try {
    const response = await articleApi.getById(articleId.value)

    if (response.success && response.data) {
      const article = response.data

      // 填充表单数据
      formData.title = article.title
      formData.content = article.content
      formData.coverImage = article.coverImage || ''
      formData.categoryId = article.categoryId || 0
      formData.tagIds = article.tags?.map(tag => tag.id) || []
      formData.status = article.status
      formData.publishedAt = article.publishedAt || ''
      formData.seoTitle = article.seoTitle || ''
      formData.seoDescription = article.seoDescription || ''
      formData.seoKeywords = article.seoKeywords || ''
    } else {
      ElMessage.error('文章不存在')
      router.push('/articles')
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
    router.push('/articles')
  } finally {
    loading.value = false
  }
}

/**
 * 验证表单
 */
const validateForm = async (): Promise<boolean> => {
  if (!formRef.value) return false

  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
    return false
  }
}

/**
 * 更新文章
 */
const updateArticle = async (status: ArticleStatus) => {
  // 验证表单
  const isValid = await validateForm()
  if (!isValid) return

  // 如果是发布状态，确保有发布时间
  if (status === 'published' && !formData.publishedAt) {
    formData.publishedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  saving.value = true
  try {
    const data: ArticleUpdateRequest = {
      ...formData,
      status,
      categoryId: Number(formData.categoryId),
    }

    const response = await articleApi.update(articleId.value, data)

    if (response.success) {
      ElMessage.success(status === 'draft' ? '草稿保存成功' : '文章更新成功')
      router.push('/articles')
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新文章失败:', error)
    ElMessage.error('更新文章失败')
  } finally {
    saving.value = false
  }
}

/**
 * 处理保存草稿
 */
const handleSaveDraft = () => {
  updateArticle('draft')
}

/**
 * 处理发布
 */
const handlePublish = () => {
  updateArticle('published')
}

/**
 * 处理取消
 */
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消吗？未保存的修改将会丢失。', '确认取消', {
    confirmButtonText: '确定',
    cancelButtonText: '继续编辑',
    type: 'warning',
  })
    .then(() => {
      router.push('/articles')
    })
    .catch(() => {
      // 用户选择继续编辑
    })
}

/**
 * 初始化数据
 */
onMounted(() => {
  fetchCategories()
  fetchTags()
  fetchArticle()
})
</script>

<style scoped lang="scss">
.article-edit-page {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.article-form-card {
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

  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.article-form {
  .form-layout {
    display: flex;
    gap: 20px;
  }

  .main-content {
    flex: 1;
    min-width: 0;

    .title-input {
      :deep(.el-input__inner) {
        font-size: 24px;
        font-weight: 600;
        height: 60px;
        line-height: 60px;
      }
    }
  }

  .metadata-sidebar {
    width: 320px;
    flex-shrink: 0;

    .metadata-card {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-card__header) {
        padding: 12px 16px;
        background-color: var(--el-fill-color-light);
      }

      :deep(.el-card__body) {
        padding: 16px;
      }

      .card-title {
        font-weight: 600;
        font-size: 14px;

        .required {
          color: var(--el-color-danger);
        }
      }

      .card-header-with-collapse,
      .card-header-with-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .el-form-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .article-form {
    .form-layout {
      flex-direction: column;
    }

    .metadata-sidebar {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .article-edit-page {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .article-form {
    .main-content {
      .title-input {
        :deep(.el-input__inner) {
          font-size: 18px;
          height: 48px;
          line-height: 48px;
        }
      }
    }
  }
}
</style>
