<template>
  <div class="config-page">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <div class="header-actions">
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置为默认值
            </el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              <el-icon><Check /></el-icon>
              保存配置
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="config-content">
        <!-- 左侧标签页 -->
        <el-tabs v-model="activeTab" tab-position="left" class="config-tabs">
          <!-- 关于页面 -->
          <el-tab-pane label="关于页面" name="about">
            <el-form label-width="120px" class="config-form">
              <el-form-item label="姓名">
                <el-input v-model="aboutForm.name" placeholder="请输入姓名" maxlength="60" />
              </el-form-item>
              <el-form-item label="头衔">
                <el-input v-model="aboutForm.title" placeholder="例如：前端工程师" maxlength="80" />
              </el-form-item>
              <el-form-item label="头像">
                <el-input v-model="aboutForm.avatar" placeholder="/uploads/.. 或 https://...">
                  <template #append>
                    <el-button @click="showAvatarUpload = true">
                      <el-icon><Upload /></el-icon>
                      上传
                    </el-button>
                  </template>
                </el-input>
                <div v-if="aboutForm.avatar" class="image-preview" style="margin-top: 8px">
                  <el-image
                    :src="aboutForm.avatar"
                    fit="cover"
                    style="width: 120px; height: 120px; border-radius: 50%"
                  />
                </div>
              </el-form-item>
              <el-form-item label="所在地">
                <el-input v-model="aboutForm.location" placeholder="例如：上海" maxlength="100" />
              </el-form-item>
              <el-form-item label="个人网站">
                <el-input v-model="aboutForm.website" placeholder="https://example.com" />
              </el-form-item>
              <el-form-item label="简历链接">
                <el-input v-model="aboutForm.resumeUrl" placeholder="https://.../resume.pdf" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="aboutForm.contacts.email" placeholder="you@example.com" />
              </el-form-item>
              <el-form-item label="电话">
                <el-input v-model="aboutForm.contacts.phone" placeholder="可选" />
              </el-form-item>
              <el-form-item label="微信">
                <el-input v-model="aboutForm.contacts.wechat" placeholder="可选" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input
                  v-model="bioInput"
                  type="textarea"
                  :rows="4"
                  placeholder="每行一段，将自动拆分为数组"
                />
              </el-form-item>
              <el-form-item label="兴趣爱好">
                <el-select
                  v-model="aboutForm.interests"
                  multiple
                  filterable
                  allow-create
                  placeholder="输入后回车新增"
                >
                  <el-option v-for="i in aboutForm.interests" :key="i" :label="i" :value="i" />
                </el-select>
              </el-form-item>
              <el-form-item label="语言">
                <el-select
                  v-model="aboutForm.languages"
                  multiple
                  filterable
                  allow-create
                  placeholder="输入后回车新增"
                >
                  <el-option v-for="i in aboutForm.languages" :key="i" :label="i" :value="i" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingAbout" @click="saveAbout"
                  >保存关于信息</el-button
                >
                <el-button @click="loadAbout">重载</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form
              ref="basicFormRef"
              :model="formData"
              :rules="formRules"
              label-width="120px"
              class="config-form"
            >
              <el-form-item label="网站名称" prop="siteName">
                <el-input
                  v-model="formData.siteName"
                  placeholder="请输入网站名称"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="网站副标题" prop="siteSubtitle">
                <el-input
                  v-model="formData.siteSubtitle"
                  placeholder="请输入网站副标题（可选）"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="网站描述" prop="siteDescription">
                <el-input
                  v-model="formData.siteDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入网站描述（可选）"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="网站 Logo" prop="siteLogo">
                <el-input
                  v-model="formData.siteLogo"
                  placeholder="请输入 Logo URL（可选）"
                  maxlength="500"
                >
                  <template #append>
                    <el-button @click="showLogoUpload = true">
                      <el-icon><Upload /></el-icon>
                      上传
                    </el-button>
                  </template>
                </el-input>
                <div v-if="formData.siteLogo" class="image-preview">
                  <el-image
                    :src="formData.siteLogo"
                    fit="contain"
                    style="width: 120px; height: 120px"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <div>加载失败</div>
                      </div>
                    </template>
                  </el-image>
                </div>
              </el-form-item>

              <el-form-item label="网站 Favicon" prop="siteFavicon">
                <el-input
                  v-model="formData.siteFavicon"
                  placeholder="请输入 Favicon URL（可选）"
                  maxlength="500"
                >
                  <template #append>
                    <el-button @click="showFaviconUpload = true">
                      <el-icon><Upload /></el-icon>
                      上传
                    </el-button>
                  </template>
                </el-input>
                <div v-if="formData.siteFavicon" class="image-preview">
                  <el-image
                    :src="formData.siteFavicon"
                    fit="contain"
                    style="width: 64px; height: 64px"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <div>加载失败</div>
                      </div>
                    </template>
                  </el-image>
                </div>
              </el-form-item>

              <el-form-item label="网站 URL" prop="siteUrl">
                <el-input
                  v-model="formData.siteUrl"
                  placeholder="https://example.com（可选）"
                  maxlength="200"
                />
              </el-form-item>

              <el-form-item label="管理员邮箱" prop="adminEmail">
                <el-input
                  v-model="formData.adminEmail"
                  placeholder="admin@example.com（可选）"
                  maxlength="100"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- SEO 设置 -->
          <el-tab-pane label="SEO 设置" name="seo">
            <el-form
              ref="seoFormRef"
              :model="formData"
              :rules="formRules"
              label-width="150px"
              class="config-form"
            >
              <el-form-item label="SEO 标题" prop="seoTitle">
                <el-input
                  v-model="formData.seoTitle"
                  placeholder="请输入 SEO 标题（可选）"
                  maxlength="60"
                  show-word-limit
                />
                <div class="form-tip">建议长度：50-60 个字符，用于搜索引擎结果页面显示</div>
              </el-form-item>

              <el-form-item label="SEO 描述" prop="seoDescription">
                <el-input
                  v-model="formData.seoDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入 SEO 描述（可选）"
                  maxlength="160"
                  show-word-limit
                />
                <div class="form-tip">建议长度：150-160 个字符，用于搜索引擎结果页面显示</div>
              </el-form-item>

              <el-form-item label="SEO 关键词" prop="seoKeywords">
                <el-input
                  v-model="formData.seoKeywords"
                  placeholder="请输入 SEO 关键词，多个关键词用逗号分隔（可选）"
                  maxlength="200"
                  show-word-limit
                />
                <div class="form-tip">多个关键词用英文逗号分隔，例如：博客,技术,编程</div>
              </el-form-item>

              <el-form-item label="Google Analytics ID" prop="googleAnalyticsId">
                <el-input
                  v-model="formData.googleAnalyticsId"
                  placeholder="G-XXXXXXXXXX（可选）"
                  maxlength="50"
                />
                <div class="form-tip">
                  Google Analytics 跟踪 ID，格式如：G-XXXXXXXXXX 或 UA-XXXXXXXXX-X
                </div>
              </el-form-item>

              <el-form-item label="百度统计 ID" prop="baiduAnalyticsId">
                <el-input
                  v-model="formData.baiduAnalyticsId"
                  placeholder="请输入百度统计 ID（可选）"
                  maxlength="50"
                />
                <div class="form-tip">百度统计跟踪 ID，可在百度统计后台获取</div>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 社交媒体 -->
          <el-tab-pane label="社交媒体" name="social">
            <el-form
              ref="socialFormRef"
              :model="formData"
              :rules="formRules"
              label-width="120px"
              class="config-form"
            >
              <el-form-item label="微信" prop="wechat">
                <el-input
                  v-model="formData.wechat"
                  placeholder="请输入微信号或二维码链接（可选）"
                  maxlength="200"
                />
              </el-form-item>

              <el-form-item label="微博" prop="weibo">
                <el-input
                  v-model="formData.weibo"
                  placeholder="https://weibo.com/username（可选）"
                  maxlength="200"
                />
              </el-form-item>

              <el-form-item label="GitHub" prop="github">
                <el-input
                  v-model="formData.github"
                  placeholder="https://github.com/username（可选）"
                  maxlength="200"
                />
              </el-form-item>

              <el-form-item label="Twitter" prop="twitter">
                <el-input
                  v-model="formData.twitter"
                  placeholder="https://twitter.com/username（可选）"
                  maxlength="200"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 其他设置 -->
          <el-tab-pane label="其他设置" name="other">
            <el-form ref="otherFormRef" :model="formData" label-width="120px" class="config-form">
              <el-empty description="暂无其他配置项" />
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- Logo 上传对话框 -->
    <el-dialog v-model="showLogoUpload" title="上传网站 Logo" width="500px">
      <ImageUpload v-model="formData.siteLogo" :limit="1" @success="showLogoUpload = false" />
      <template #footer>
        <el-button @click="showLogoUpload = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Favicon 上传对话框 -->
    <el-dialog v-model="showFaviconUpload" title="上传网站 Favicon" width="500px">
      <ImageUpload v-model="formData.siteFavicon" :limit="1" @success="showFaviconUpload = false" />
      <template #footer>
        <el-button @click="showFaviconUpload = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Avatar 上传对话框 -->
    <el-dialog v-model="showAvatarUpload" title="上传关于页头像" width="500px">
      <ImageUpload v-model="aboutForm.avatar" :limit="1" @success="showAvatarUpload = false" />
      <template #footer>
        <el-button @click="showAvatarUpload = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Check, RefreshLeft, Upload, Picture } from '@element-plus/icons-vue'
import { configApi, type ConfigData, type AboutProfile } from '@/api/config'
import ImageUpload from '@/components/upload/ImageUpload.vue'

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 当前激活的标签页
const activeTab = ref('basic')

// 图片上传对话框
const showLogoUpload = ref(false)
const showFaviconUpload = ref(false)
const showAvatarUpload = ref(false)

// 表单引用
const basicFormRef = ref<FormInstance>()
const seoFormRef = ref<FormInstance>()
const socialFormRef = ref<FormInstance>()
const otherFormRef = ref<FormInstance>()

// 关于页表单状态
const aboutForm = reactive<AboutProfile>({
  name: '',
  title: '',
  avatar: '',
  bio: ['', '', ''],
  location: '',
  website: '',
  resumeUrl: '',
  contacts: { email: '', phone: '', wechat: '' },
  interests: [],
  languages: [],
  projects: [],
})
const bioInput = ref('')
const savingAbout = ref(false)

// 表单数据
const formData = reactive<ConfigData>({
  siteName: '',
  siteSubtitle: '',
  siteDescription: '',
  siteLogo: '',
  siteFavicon: '',
  siteUrl: '',
  adminEmail: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  googleAnalyticsId: '',
  baiduAnalyticsId: '',
  wechat: '',
  weibo: '',
  github: '',
  twitter: '',
})

// 原始配置数据（用于重置）
const originalConfig = reactive<ConfigData>({
  siteName: '',
  siteSubtitle: '',
  siteDescription: '',
  siteLogo: '',
  siteFavicon: '',
  siteUrl: '',
  adminEmail: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  googleAnalyticsId: '',
  baiduAnalyticsId: '',
  wechat: '',
  weibo: '',
  github: '',
  twitter: '',
})

// URL 验证函数
const validateUrl = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      callback(new Error('URL 必须以 http:// 或 https:// 开头'))
      return
    }
    callback()
  } catch (error) {
    callback(new Error('请输入有效的 URL 地址'))
  }
}

// 邮箱验证函数
const validateEmail = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
    return
  }
  callback()
}

// 表单验证规则
const formRules: FormRules = {
  siteName: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { min: 1, max: 100, message: '网站名称长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  siteUrl: [{ validator: validateUrl, trigger: 'blur' }],
  adminEmail: [{ validator: validateEmail, trigger: 'blur' }],
  weibo: [{ validator: validateUrl, trigger: 'blur' }],
  github: [{ validator: validateUrl, trigger: 'blur' }],
  twitter: [{ validator: validateUrl, trigger: 'blur' }],
}

/**
 * 获取系统配置
 */
const fetchConfig = async () => {
  loading.value = true
  try {
    const response = await configApi.getConfig()

    if (response.data) {
      // 更新表单数据
      Object.assign(formData, response.data)
      // 保存原始配置
      Object.assign(originalConfig, response.data)
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
    ElMessage.error('获取系统配置失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  // 验证所有表单
  const formRefs = [basicFormRef.value, seoFormRef.value, socialFormRef.value]
  const validationPromises = formRefs
    .filter(ref => ref !== undefined)
    .map(ref => ref!.validate().catch(() => false))

  const results = await Promise.all(validationPromises)
  const allValid = results.every(result => result === true)

  if (!allValid) {
    ElMessage.warning('请检查表单填写是否正确')
    return
  }

  submitting.value = true
  try {
    // 准备更新数据（只发送有值的字段）
    const updateData: ConfigData = {}

    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof ConfigData]
      if (value !== undefined && value !== null && value !== '') {
        updateData[key as keyof ConfigData] = value
      }
    })

    await configApi.updateConfig(updateData)
    ElMessage.success('系统配置保存成功')

    // 刷新配置
    fetchConfig()
  } catch (error) {
    console.error('保存系统配置失败:', error)
    ElMessage.error('保存系统配置失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 处理重置为默认值
 */
const handleReset = () => {
  ElMessageBox.confirm('确定要重置为默认值吗？这将恢复到上次保存的配置。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 恢复到原始配置
      Object.assign(formData, originalConfig)

      // 清除验证错误
      basicFormRef.value?.clearValidate()
      seoFormRef.value?.clearValidate()
      socialFormRef.value?.clearValidate()

      ElMessage.success('已重置为上次保存的配置')
    })
    .catch(() => {
      // 用户取消重置
    })
}

/**
 * 初始化
 */
const loadAbout = async () => {
  try {
    const resp = await configApi.getAbout()
    const data = resp.data
    if (data) {
      Object.assign(aboutForm, data)
      bioInput.value = Array.isArray(data.bio) ? data.bio.join('\n') : ''
    }
  } catch (e) {
    // 忽略错误，保持默认
  }
}

const saveAbout = async () => {
  savingAbout.value = true
  try {
    const payload: AboutProfile = {
      ...aboutForm,
      bio: bioInput.value
        ? bioInput.value
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    }
    const resp = await configApi.setAbout(payload)
    if (resp.success) {
      ElMessage.success('关于信息已保存')
      loadAbout()
    } else {
      ElMessage.error(resp.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    savingAbout.value = false
  }
}

onMounted(() => {
  fetchConfig()
  loadAbout()
})
</script>

<style scoped lang="scss">
.config-page {
  padding: 20px;
}

.config-card {
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  :deep(.el-card__body) {
    padding: 0;
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

.config-content {
  min-height: 600px;
}

.config-tabs {
  :deep(.el-tabs__header) {
    width: 200px;
    margin-right: 0;
  }

  :deep(.el-tabs__content) {
    padding: 20px 30px;
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__item) {
    text-align: left;
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
  }
}

.config-form {
  max-width: 800px;

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    line-height: 1.5;
  }

  .image-preview {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    display: inline-block;
    background-color: var(--el-fill-color-lighter);
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
      font-size: 24px;
      margin-bottom: 4px;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .config-tabs {
    :deep(.el-tabs__header) {
      width: 160px;
    }

    :deep(.el-tabs__item) {
      padding: 0 15px;
      font-size: 14px;
    }
  }

  .config-form {
    :deep(.el-form-item__label) {
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .config-page {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .header-actions {
      width: 100%;

      .el-button {
        flex: 1;
        font-size: 12px;
      }
    }
  }

  .config-tabs {
    :deep(.el-tabs__header) {
      width: 100%;
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav) {
      display: flex;
      width: 100%;
    }

    :deep(.el-tabs__item) {
      flex: 1;
      text-align: center;
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      font-size: 13px;
    }

    :deep(.el-tabs__content) {
      padding: 15px;
    }
  }

  .config-form {
    :deep(.el-form-item__label) {
      width: 100% !important;
      text-align: left;
      margin-bottom: 5px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }
}
</style>
