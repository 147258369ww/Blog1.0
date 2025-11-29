<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { passwordPolicy } from '@/config/security'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginRequest } from '@/types/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive<LoginRequest>({
  email: '',
  password: '',
  rememberMe: false,
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'change'],
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      min: passwordPolicy.minLength,
      message: `密码长度不能少于 ${passwordPolicy.minLength} 位`,
      trigger: ['blur', 'change'],
    },
  ],
}

/**
 * 处理登录提交
 */
const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  // 验证表单
  const valid = await formEl.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    // 调用登录 API
    await authStore.login(loginForm)

    // 登录成功提示
    ElMessage.success('登录成功')

    // 跳转到目标页面或仪表盘
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (error: unknown) {
    // 显示错误提示
    let errorMessage = '登录失败，请检查邮箱和密码'
    if (typeof error === 'object' && error !== null) {
      const maybe = error as { message?: string; error?: string }
      errorMessage = maybe.message || maybe.error || errorMessage
    }
    ElMessage.error(errorMessage)
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 提交表单
 */
const submitForm = () => {
  handleLogin(loginFormRef.value)
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-logo">
            <el-icon :size="64">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="currentColor"
                  d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
                />
                <path
                  fill="currentColor"
                  d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"
                />
              </svg>
            </el-icon>
          </div>
          <h1 class="brand-title">博客后台管理系统</h1>
          <p class="brand-subtitle">Blog Admin Management System</p>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="login-form-wrapper">
        <div class="login-form-container">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">请输入您的账号和密码</p>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            size="large"
            @keyup.enter="submitForm"
          >
            <el-form-item prop="email">
              <el-input
                v-model="loginForm.email"
                placeholder="请输入邮箱地址"
                :prefix-icon="'Message'"
                clearable
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" class="login-button" :loading="loading" @click="submitForm">
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.login-page {
  width: 100%;
  height: 100%;
}

.login-container {
  display: flex;
  width: 100%;
  min-height: 500px;

  @include mobile {
    flex-direction: column;
  }
}

// 左侧品牌区域
.login-brand {
  flex: 1;
  @include flex-center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: $spacing-xl;

  @include mobile {
    padding: $spacing-lg;
    min-height: 200px;
  }
}

.brand-content {
  text-align: center;
}

.brand-logo {
  margin-bottom: $spacing-lg;

  .el-icon {
    color: #ffffff;
  }
}

.brand-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 $spacing-sm 0;
  line-height: 1.4;

  @include mobile {
    font-size: 24px;
  }
}

.brand-subtitle {
  font-size: $font-size-base;
  opacity: 0.9;
  margin: 0;
}

// 右侧表单区域
.login-form-wrapper {
  flex: 1;
  @include flex-center;
  padding: $spacing-xl;
  background-color: #ffffff;

  @include mobile {
    padding: $spacing-lg;
  }
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  text-align: center;

  @include mobile {
    font-size: 20px;
  }
}

.form-subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0 0 $spacing-xl 0;
  text-align: center;
}

.login-form {
  margin-top: $spacing-xl;

  :deep(.el-form-item) {
    margin-bottom: $spacing-lg;
  }

  :deep(.el-input__wrapper) {
    padding: 12px 15px;
  }
}

.form-options {
  width: 100%;
  @include flex-between;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: $font-size-lg;
  font-weight: 500;
}
</style>
