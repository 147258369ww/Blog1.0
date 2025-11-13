<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <h1 class="register-title">创建账户</h1>
        <p class="register-subtitle">注册开始使用</p>

        <!-- Step Indicator -->
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">邮箱</div>
          </div>
          <div class="step-divider"></div>
          <div class="step" :class="{ active: currentStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-label">详细信息</div>
          </div>
        </div>

        <!-- Step 1: Send Verification Code -->
        <form v-if="currentStep === 1" @submit.prevent="handleSendCode" class="register-form">
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

          <button
            type="submit"
            class="btn-submit"
            :disabled="isLoading || !formData.email.trim()"
          >
            {{ isLoading ? '发送中...' : '发送验证码' }}
          </button>

          <p class="login-link">
            已有账户？
            <router-link to="/login" class="link">立即登录</router-link>
          </p>
        </form>

        <!-- Step 2: Complete Registration -->
        <form v-if="currentStep === 2" @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="verification-code" class="form-label">验证码</label>
            <input
              id="verification-code"
              v-model="formData.verificationCode"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.verificationCode }"
              placeholder="请输入验证码"
              @blur="validateVerificationCode"
            />
            <span v-if="errors.verificationCode" class="form-error">{{ errors.verificationCode }}</span>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.username }"
              placeholder="请输入用户名"
              @blur="validateUsername"
            />
            <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
          </div>

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

          <div class="form-group">
            <label for="confirm-password" class="form-label">确认密码</label>
            <input
              id="confirm-password"
              v-model="formData.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'form-input-error': errors.confirmPassword }"
              placeholder="请再次输入密码"
              @blur="validateConfirmPassword"
            />
            <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
          </div>

          <div class="button-group">
            <button
              type="button"
              class="btn-back"
              @click="goBackToStep1"
              :disabled="isLoading"
            >
              返回
            </button>
            <button
              type="submit"
              class="btn-submit"
              :disabled="isLoading || !isStep2Valid"
            >
              {{ isLoading ? '创建中...' : '创建账户' }}
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { authApi } from '@/services/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Current step (1: send code, 2: complete registration)
const currentStep = ref(1)

// Form data
const formData = ref({
  email: '',
  verificationCode: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// Form errors
const errors = ref({
  email: '',
  verificationCode: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// Loading state
const isLoading = ref(false)

// Error message
const errorMessage = ref('')

// Step 2 form validation
const isStep2Valid = computed(() => {
  return (
    formData.value.verificationCode.trim() !== '' &&
    formData.value.username.trim() !== '' &&
    formData.value.password.trim() !== '' &&
    formData.value.confirmPassword.trim() !== '' &&
    !errors.value.verificationCode &&
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword
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
 * Validate verification code field
 */
const validateVerificationCode = () => {
  const code = formData.value.verificationCode.trim()
  
  if (!code) {
    errors.value.verificationCode = '请输入验证码'
    return false
  }
  
  if (code.length < 4) {
    errors.value.verificationCode = '请输入有效的验证码'
    return false
  }
  
  errors.value.verificationCode = ''
  return true
}

/**
 * Validate username field
 */
const validateUsername = () => {
  const username = formData.value.username.trim()
  
  if (!username) {
    errors.value.username = '请输入用户名'
    return false
  }
  
  if (username.length < 3) {
    errors.value.username = '用户名至少需要3个字符'
    return false
  }
  
  if (username.length > 20) {
    errors.value.username = '用户名不能超过20个字符'
    return false
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    errors.value.username = '用户名只能包含字母、数字和下划线'
    return false
  }
  
  errors.value.username = ''
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
 * Validate confirm password field
 */
const validateConfirmPassword = () => {
  const confirmPassword = formData.value.confirmPassword
  
  if (!confirmPassword) {
    errors.value.confirmPassword = '请确认密码'
    return false
  }
  
  if (confirmPassword !== formData.value.password) {
    errors.value.confirmPassword = '两次输入的密码不一致'
    return false
  }
  
  errors.value.confirmPassword = ''
  return true
}

/**
 * Handle send verification code (Step 1)
 */
const handleSendCode = async () => {
  errorMessage.value = ''
  
  if (!validateEmail()) {
    return
  }
  
  isLoading.value = true
  
  try {
    await authApi.sendVerificationCode(formData.value.email.trim())
    
    toast.success('验证码已发送到您的邮箱！')
    currentStep.value = 2
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '发送验证码失败，请重试'
    toast.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle registration (Step 2)
 */
const handleRegister = async () => {
  errorMessage.value = ''
  
  // Validate all fields
  const isCodeValid = validateVerificationCode()
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()
  
  if (!isCodeValid || !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }
  
  isLoading.value = true
  
  try {
    await authStore.register({
      email: formData.value.email.trim(),
      username: formData.value.username.trim(),
      password: formData.value.password,
      code: formData.value.verificationCode.trim()
    })
    
    toast.success('账户创建成功！')
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '注册失败，请重试'
    toast.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Go back to step 1
 */
const goBackToStep1 = () => {
  currentStep.value = 1
  errorMessage.value = ''
  
  // Clear step 2 fields
  formData.value.verificationCode = ''
  formData.value.username = ''
  formData.value.password = ''
  formData.value.confirmPassword = ''
  
  // Clear step 2 errors
  errors.value.verificationCode = ''
  errors.value.username = ''
  errors.value.password = ''
  errors.value.confirmPassword = ''
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--bg-secondary, #f9fafb);
}

.register-container {
  width: 100%;
  max-width: 480px;
}

.register-card {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.register-subtitle {
  font-size: 1rem;
  color: var(--text-secondary, #667085);
  margin: 0 0 2rem 0;
  text-align: center;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: var(--color-gray-300, #d0d5dd);
  color: var(--text-secondary, #667085);
  transition: all 0.3s;
}

.step.active .step-number {
  background: var(--color-primary-600, #7f56d9);
  color: #ffffff;
}

.step.completed .step-number {
  background: var(--color-success-700, #027a48);
  color: #ffffff;
}

.step-label {
  font-size: 0.875rem;
  color: var(--text-secondary, #667085);
  font-weight: 500;
}

.step.active .step-label {
  color: var(--text-primary, #1a1a1a);
}

.step-divider {
  width: 60px;
  height: 2px;
  background: var(--color-gray-300, #d0d5dd);
}

/* Form Styles */
.register-form {
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

.button-group {
  display: flex;
  gap: 1rem;
}

.btn-submit,
.btn-back {
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
}

.btn-submit {
  color: #ffffff;
  background: var(--color-primary-600, #7f56d9);
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

.btn-back {
  color: var(--text-primary, #1a1a1a);
  background: var(--color-gray-50, #f9fafb);
  border: 1px solid var(--color-gray-300, #d0d5dd);
}

.btn-back:hover:not(:disabled) {
  background: var(--color-gray-300, #d0d5dd);
}

.btn-back:disabled {
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
  margin-top: 1rem;
}

.login-link {
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
  .register-card {
    padding: 2rem 1.5rem;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .step-divider {
    width: 40px;
  }
}

@media (max-width: 390px) {
  .register-page {
    padding: 1rem 0.5rem;
  }

  .register-card {
    padding: 1.5rem 1rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .step-indicator {
    gap: 0.5rem;
  }

  .step-divider {
    width: 30px;
  }

  .step-number {
    width: 36px;
    height: 36px;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
