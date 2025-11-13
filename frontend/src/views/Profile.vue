<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- User Info Section -->
      <div class="profile-card">
        <h1 class="profile-title">个人资料</h1>
        
        <div v-if="authStore.user" class="user-info">
          <div class="avatar-section">
            <div class="avatar">
              <img
                v-if="authStore.user.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.user.username"
              />
              <span v-else class="avatar-placeholder">
                {{ authStore.user.username.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">用户名</label>
              <p class="info-value">{{ authStore.user.username }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">邮箱</label>
              <p class="info-value">{{ authStore.user.email }}</p>
            </div>

            <div class="info-item">
              <label class="info-label">角色</label>
              <p class="info-value">
                <span class="role-badge" :class="authStore.user.role">
                  {{ authStore.user.role === 'admin' ? '管理员' : '用户' }}
                </span>
              </p>
            </div>

            <div class="info-item">
              <label class="info-label">注册时间</label>
              <p class="info-value">{{ formatDate(authStore.user.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="profile-card">
        <h2 class="section-title">修改密码</h2>
        
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label for="old-password" class="form-label">当前密码</label>
            <input
              id="old-password"
              v-model="passwordForm.oldPassword"
              type="password"
              class="form-input"
              :class="{ 'form-input-error': passwordErrors.oldPassword }"
              placeholder="请输入当前密码"
              @blur="validateOldPassword"
            />
            <span v-if="passwordErrors.oldPassword" class="form-error">
              {{ passwordErrors.oldPassword }}
            </span>
          </div>

          <div class="form-group">
            <label for="new-password" class="form-label">新密码</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              :class="{ 'form-input-error': passwordErrors.newPassword }"
              placeholder="请输入新密码"
              @blur="validateNewPassword"
            />
            <span v-if="passwordErrors.newPassword" class="form-error">
              {{ passwordErrors.newPassword }}
            </span>
          </div>

          <div class="form-group">
            <label for="confirm-password" class="form-label">确认新密码</label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'form-input-error': passwordErrors.confirmPassword }"
              placeholder="请再次输入新密码"
              @blur="validateConfirmPassword"
            />
            <span v-if="passwordErrors.confirmPassword" class="form-error">
              {{ passwordErrors.confirmPassword }}
            </span>
          </div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="isChangingPassword || !isPasswordFormValid"
          >
            {{ isChangingPassword ? '更新中...' : '更新密码' }}
          </button>

          <div v-if="passwordErrorMessage" class="error-message">
            {{ passwordErrorMessage }}
          </div>

          <div v-if="passwordSuccessMessage" class="success-message">
            {{ passwordSuccessMessage }}
          </div>
        </form>
      </div>

      <!-- Logout Section -->
      <div class="profile-card">
        <h2 class="section-title">账户操作</h2>
        <button @click="handleLogout" class="btn-logout" :disabled="isLoggingOut">
          {{ isLoggingOut ? '退出中...' : '退出登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Password form data
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Password form errors
const passwordErrors = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Loading states
const isChangingPassword = ref(false)
const isLoggingOut = ref(false)

// Messages
const passwordErrorMessage = ref('')
const passwordSuccessMessage = ref('')

// Password form validation
const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.oldPassword.trim() !== '' &&
    passwordForm.value.newPassword.trim() !== '' &&
    passwordForm.value.confirmPassword.trim() !== '' &&
    !passwordErrors.value.oldPassword &&
    !passwordErrors.value.newPassword &&
    !passwordErrors.value.confirmPassword
  )
})

/**
 * Fetch current user data on mount
 */
onMounted(async () => {
  if (!authStore.user) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      toast.error('加载用户数据失败')
    }
  }
})

/**
 * Format date string
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '未知日期'
  }
  
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}年${month}月${day}日`
}

/**
 * Validate old password field
 */
const validateOldPassword = () => {
  const password = passwordForm.value.oldPassword
  
  if (!password) {
    passwordErrors.value.oldPassword = '请输入当前密码'
    return false
  }
  
  passwordErrors.value.oldPassword = ''
  return true
}

/**
 * Validate new password field
 */
const validateNewPassword = () => {
  const password = passwordForm.value.newPassword
  
  if (!password) {
    passwordErrors.value.newPassword = '请输入新密码'
    return false
  }
  
  if (password.length < 8) {
    passwordErrors.value.newPassword = '密码至少需要8个字符'
    return false
  }
  
  if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    passwordErrors.value.newPassword = '密码必须包含字母和数字'
    return false
  }
  
  if (password === passwordForm.value.oldPassword) {
    passwordErrors.value.newPassword = '新密码不能与当前密码相同'
    return false
  }
  
  passwordErrors.value.newPassword = ''
  return true
}

/**
 * Validate confirm password field
 */
const validateConfirmPassword = () => {
  const confirmPassword = passwordForm.value.confirmPassword
  
  if (!confirmPassword) {
    passwordErrors.value.confirmPassword = '请确认新密码'
    return false
  }
  
  if (confirmPassword !== passwordForm.value.newPassword) {
    passwordErrors.value.confirmPassword = '两次输入的密码不一致'
    return false
  }
  
  passwordErrors.value.confirmPassword = ''
  return true
}

/**
 * Handle password change
 */
const handleChangePassword = async () => {
  // Clear previous messages
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''
  
  // Validate all fields
  const isOldPasswordValid = validateOldPassword()
  const isNewPasswordValid = validateNewPassword()
  const isConfirmPasswordValid = validateConfirmPassword()
  
  if (!isOldPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
    return
  }
  
  isChangingPassword.value = true
  
  try {
    await authStore.changePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    )
    
    passwordSuccessMessage.value = '密码更新成功！'
    toast.success('密码更新成功！')
    
    // Clear form
    passwordForm.value.oldPassword = ''
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
  } catch (error: any) {
    passwordErrorMessage.value = error.response?.data?.error?.message || '密码更新失败，请重试'
    toast.error(passwordErrorMessage.value)
  } finally {
    isChangingPassword.value = false
  }
}

/**
 * Handle logout
 */
const handleLogout = async () => {
  isLoggingOut.value = true
  
  try {
    await authStore.logout()
    toast.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    toast.error('退出登录失败')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  padding: 2rem 1rem;
  background-color: var(--bg-secondary, #f9fafb);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 2rem 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 1.5rem 0;
}

/* User Info */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.avatar-section {
  display: flex;
  justify-content: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-primary-600, #7f56d9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #667085);
}

.info-value {
  font-size: 1rem;
  color: var(--text-primary, #1a1a1a);
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.admin {
  background: var(--color-primary-50, #f9f5ff);
  color: var(--color-primary-700, #6941c6);
}

.role-badge.user {
  background: var(--color-info-50, #eef4ff);
  color: var(--color-info-700, #3538cd);
}

/* Password Form */
.password-form {
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

.btn-submit,
.btn-logout {
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

.btn-logout {
  width: 100%;
  color: #ffffff;
  background: var(--color-error-700, #c01048);
}

.btn-logout:hover:not(:disabled) {
  background: #a00d3d;
}

.btn-logout:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-logout:disabled {
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

.success-message {
  padding: 0.75rem 1rem;
  background: var(--color-success-50, #ecfdf3);
  border: 1px solid var(--color-success-700, #027a48);
  border-radius: 8px;
  color: var(--color-success-700, #027a48);
  font-size: 0.875rem;
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 834px) {
  .profile-card {
    padding: 1.5rem;
  }

  .profile-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-placeholder {
    font-size: 2.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 390px) {
  .profile-page {
    padding: 1rem 0.5rem;
  }

  .profile-card {
    padding: 1rem;
  }

  .profile-title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .avatar-placeholder {
    font-size: 2rem;
  }
}
</style>
