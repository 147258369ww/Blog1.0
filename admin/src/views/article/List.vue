<template>
  <div class="article-list-page">
    <el-card class="article-list-card">
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章标题..."
              clearable
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="filterStatus"
              placeholder="状态筛选"
              clearable
              style="width: 120px; margin-right: 10px"
              @change="handleSearch"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-select
              v-model="filterCategory"
              placeholder="分类筛选"
              clearable
              style="width: 150px; margin-right: 10px"
              @change="handleSearch"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
            <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建文章
            </el-button>
          </div>
        </div>
      </template>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedArticles.length > 0" class="batch-actions">
        <span class="batch-info">已选择 {{ selectedArticles.length }} 项</span>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <!-- 桌面/平板: 表格视图 -->
      <el-table
        v-if="!isMobile"
        v-loading="loading"
        :data="articles"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column label="封面图" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              :preview-src-list="[row.coverImage]"
              fit="cover"
              style="width: 60px; height: 40px; border-radius: 4px"
              lazy
            />
            <span v-else class="no-image">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row.id)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category.name" label="分类" width="120" />
        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag.id"
              size="small"
              style="margin-right: 4px; margin-bottom: 4px"
            >
              {{ tag.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-select
              :model-value="row.status"
              size="small"
              @change="(value: ArticleStatus) => handleQuickStatusChange(row.id, value)"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" sortable="custom" />
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row.id)"> 编辑 </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端: 卡片视图 -->
      <div v-else v-loading="loading" class="mobile-card-list">
        <div v-if="articles.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无文章" />
        </div>
        <div v-else class="card-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card touch-feedback"
            @click="handleEdit(article.id)"
          >
            <div class="article-card-header">
              <el-image
                v-if="article.coverImage"
                :src="article.coverImage"
                fit="cover"
                class="article-cover"
                lazy
              />
              <div v-else class="article-cover-placeholder">
                <el-icon :size="32"><Picture /></el-icon>
              </div>
            </div>
            <div class="article-card-body">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-meta">
                <el-tag size="small" type="info">{{ article.category?.name || '未分类' }}</el-tag>
                <el-tag
                  v-for="tag in article.tags?.slice(0, 2)"
                  :key="tag.id"
                  size="small"
                  style="margin-left: 4px"
                >
                  {{ tag.name }}
                </el-tag>
                <span v-if="article.tags && article.tags.length > 2" class="more-tags">
                  +{{ article.tags.length - 2 }}
                </span>
              </div>
              <div class="article-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ article.viewCount || 0 }}
                </span>
                <span class="stat-item">
                  {{ formatDate(article.createdAt) }}
                </span>
              </div>
              <div class="article-status">
                <el-tag
                  :type="
                    article.status === 'published'
                      ? 'success'
                      : article.status === 'draft'
                        ? 'warning'
                        : 'info'
                  "
                  size="small"
                >
                  {{
                    article.status === 'published'
                      ? '已发布'
                      : article.status === 'draft'
                        ? '草稿'
                        : '已归档'
                  }}
                </el-tag>
              </div>
            </div>
            <div class="article-card-actions" @click.stop>
              <el-button size="small" :icon="Edit" @click="handleEdit(article.id)">
                编辑
              </el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(article)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articleApi, type ArticleListItem, type ArticleStatus } from '@/api/article'
import { categoryApi } from '@/api/category'
import type { Category } from '@/types/models'
import { formatDate } from '@/utils/date'
import { useResponsive } from '@/composables/useResponsive'
import { Search, Plus, Delete, Edit, View, Picture } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式工具
const { isMobile } = useResponsive()

// 加载状态
const loading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 筛选条件
const filterStatus = ref<ArticleStatus | ''>('')
const filterCategory = ref<number | ''>('')

// 分类列表
const categories = ref<Category[]>([])

// 文章列表
const articles = ref<ArticleListItem[]>([])

// 选中的文章
const selectedArticles = ref<ArticleListItem[]>([])

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 排序信息
const sortInfo = reactive({
  prop: '',
  order: '',
})

/**
 * 获取分类列表
 */
const fetchCategories = async () => {
  try {
    const response = await categoryApi.getList()
    categories.value = response.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

/**
 * 获取文章列表
 */
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.pageSize,
      search: searchKeyword.value,
      status: filterStatus.value || undefined,
      category: filterCategory.value || undefined,
      sortBy: sortInfo.prop || undefined,
      sortOrder: (sortInfo.order === 'ascending'
        ? 'ASC'
        : sortInfo.order === 'descending'
          ? 'DESC'
          : undefined) as 'ASC' | 'DESC' | undefined,
    }

    const response = await articleApi.getList(params)

    articles.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.page = 1
  fetchArticles()
}

/**
 * 处理排序变化
 */
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortInfo.prop = prop
  sortInfo.order = order || ''
  fetchArticles()
}

/**
 * 处理页面大小变化
 */
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
  fetchArticles()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchArticles()
}

/**
 * 处理创建文章
 */
const handleCreate = () => {
  router.push('/articles/create')
}

/**
 * 处理编辑文章
 */
const handleEdit = (id: number) => {
  router.push(`/articles/${id}/edit`)
}

/**
 * 处理查看文章
 */
const handleView = (id: number) => {
  // 在新窗口中打开文章详情页
  const routeData = router.resolve({ name: 'ArticleDetail', params: { id } })
  window.open(routeData.href, '_blank')
}

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: ArticleListItem[]) => {
  selectedArticles.value = selection
}

/**
 * 快速修改状态
 */
const handleQuickStatusChange = async (id: number, status: ArticleStatus) => {
  try {
    await articleApi.updateStatus(id, status)
    ElMessage.success('文章状态更新成功')
    fetchArticles()
  } catch (error) {
    console.error('更新文章状态失败:', error)
    ElMessage.error('更新文章状态失败')
  }
}

/**
 * 处理删除文章
 */
const handleDelete = (article: ArticleListItem) => {
  ElMessageBox.confirm(`确定要删除文章"${article.title}"吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await articleApi.delete(article.id)
        ElMessage.success('文章删除成功')
        // 如果当前页只有一条数据且不是第一页，返回上一页
        if (articles.value.length === 1 && pagination.page > 1) {
          pagination.page--
        }
        fetchArticles()
      } catch (error) {
        console.error('删除文章失败:', error)
        ElMessage.error('删除文章失败')
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
  if (selectedArticles.value.length === 0) {
    ElMessage.warning('请先选择要删除的文章')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedArticles.value.length} 篇文章吗？此操作不可恢复。`,
    '确认批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 批量删除文章
        const deletePromises = selectedArticles.value.map(article => articleApi.delete(article.id))
        await Promise.all(deletePromises)

        ElMessage.success('批量删除成功')
        selectedArticles.value = []

        // 如果当前页所有数据都被删除且不是第一页，返回上一页
        if (articles.value.length === selectedArticles.value.length && pagination.page > 1) {
          pagination.page--
        }

        fetchArticles()
      } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

/**
 * 初始化数据
 */
onMounted(() => {
  fetchCategories()
  fetchArticles()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.article-list-page {
  padding: 20px;

  @include mobile {
    padding: $spacing-md;
  }
}

.article-list-card {
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid var(--el-border-color-light);

    @include mobile {
      padding: $spacing-md;
    }
  }

  :deep(.el-card__body) {
    padding: 20px 0 0 0;

    @include mobile {
      padding: $spacing-md 0 0 0;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  @include mobile {
    width: 100%;
    flex-direction: column;

    .el-input,
    .el-select,
    .el-button {
      width: 100%;
    }
  }
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  margin: 0 20px 15px;

  @include mobile {
    margin: 0 $spacing-md $spacing-md;
    padding: $spacing-sm $spacing-md;
  }

  .batch-info {
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.no-image {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px;

  @include mobile {
    justify-content: center;
    padding: $spacing-md;

    :deep(.el-pagination) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}

// 移动端卡片视图
.mobile-card-list {
  padding: 0 $spacing-md;
  min-height: 200px;
}

.empty-state {
  padding: $spacing-xl 0;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding-bottom: $spacing-md;
}

.article-card {
  background-color: #ffffff;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-base;
  overflow: hidden;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.article-card-header {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background-color: $background-base;

  .article-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .article-cover-placeholder {
    @include flex-center;
    width: 100%;
    height: 100%;
    color: $text-placeholder;
    background-color: $background-light;
  }
}

.article-card-body {
  padding: $spacing-md;
}

.article-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  @include text-ellipsis-multi(2);
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;

  .more-tags {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-left: $spacing-xs;
  }
}

.article-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;

  .stat-item {
    @include flex-start;
    gap: 4px;

    .el-icon {
      font-size: $font-size-base;
    }
  }
}

.article-status {
  margin-bottom: $spacing-sm;
}

.article-card-actions {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid $border-lighter;

  .el-button {
    flex: 1;
    @include touch-target;
  }
}
</style>
