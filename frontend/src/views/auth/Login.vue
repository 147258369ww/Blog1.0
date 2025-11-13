<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录您的账户</p>

        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ 'form-input-error': errors.email }"
              placeholder="请输入邮箱"
              @blur="validateEmail"
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-input"
              :class="{ 'form-input-error': errors.password }"
              placeholder="请输入密码"
              @blur="validatePassword"
            />
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit"
            :disabled="isLoading || !isFormValid"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Register Link -->
          <p class="register-link">
            还没有账户？
            <router-link to="/register" class="link">立即注册</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

// Form data
const formData = ref({
  email: '',
  password: ''
})

// Form errors
const errors = ref({
  email: '',
  password: ''
})

// Loading state
const isLoading = ref(false)

// Error message
const errorMessage = ref('')

// Form validation
const isFormValid = computed(() => {
  return (
    formData.value.email.trim() !== '' &&
    formData.value.password.trim() !== '' &&
    !errors.value.email &&
    !errors.value.password
  )
})

/**
 * Validate email field
 */
const validateEmail = () => {
  const email = formData.value.email.trim()
  
  if (!email) {
    errors.value.email = '请输入邮箱'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.value.email = '请输入有效的邮箱地址'
    return false
  }
  
  errors.value.email = ''
  return true
}

/**
 * Validate password field
 */
const validatePassword = () => {
  const password = formData.value.password
  
  if (!password) {
    errors.value.password = '请输入密码'
    return false
  }
  
  if (password.length < 6) {
    errors.value.password = '密码至少需要6个字符'
    return false
  }
  
  errors.value.password = ''
  return true
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  // Clear previous error message
  errorMessage.value = ''
  
  // Validate all fields
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  
  if (!isEmailValid || !isPasswordValid) {
    return
  }
  
  isLoading.value = true
  
  try {
    // Call login action from auth store
    await authStore.login({
      email: formData.value.email.trim(),
      password: formData.value.password
    })
    
    // Show success message
    toast.success('登录成功！')
    
    // Redirect to the page user was trying to access or home
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (error: any) {
    // Handle login error
    errorMessage.value = error.response?.data?.message || '登录失败，请检查您的邮箱和密码'
    toast.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--bg-secondary, #f9fafb);
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.login-subtitle {
  font-size: 1rem;
  color: var(--text-secondary, #667085);
  margin: 0 0 2rem 0;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-gray-300, #d0d5dd);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1a1a1a);
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 48px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-600, #7f56d9);
  box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.1);
}

.form-input-error {
  border-color: var(--color-error-700, #c01048);
}

.form-input-error:focus {
  box-shadow: 0 0 0 3px rgba(192, 16, 72, 0.1);
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-error-700, #c01048);
}

.btn-submit {
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background: var(--color-primary-600, #7f56d9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  min-height: 48px;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-700, #6941c6);
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem 1rem;
  background: var(--color-error-50, #fef3f2);
  border: 1px solid var(--color-error-700, #c01048);
  border-radius: 8px;
  color: var(--color-error-700, #c01048);
  font-size: 0.875rem;
  text-align: center;
}

.register-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary, #667085);
  margin: 0;
}

.link {
  color: var(--color-primary-600, #7f56d9);
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* Mobile Responsive */
@media (max-width: 834px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 390px) {
  .login-page {
    padding: 1rem 0.5rem;
  }

  .login-card {
    padding: 1.5rem 1rem;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
