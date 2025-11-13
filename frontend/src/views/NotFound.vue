<template>
  <div class="not-found">
    <div class="not-found__container">
      <div class="not-found__content">
        <!-- 404 Icon/Illustration -->
        <div class="not-found__icon">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="4" opacity="0.2" />
            <path
              d="M70 85C70 80.5817 73.5817 77 78 77H92C96.4183 77 100 80.5817 100 85V95C100 99.4183 96.4183 103 92 103H78C73.5817 103 70 99.4183 70 95V85Z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M100 85C100 80.5817 103.582 77 108 77H122C126.418 77 130 80.5817 130 85V95C130 99.4183 126.418 103 122 103H108C103.582 103 100 99.4183 100 95V85Z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M70 125C70 120.029 74.0294 116 79 116H121C125.971 116 130 120.029 130 125C130 129.971 125.971 134 121 134H79C74.0294 134 70 129.971 70 125Z"
              fill="currentColor"
              opacity="0.3"
            />
          </svg>
        </div>

        <!-- Error Code -->
        <h1 class="not-found__code">404</h1>

        <!-- Error Message -->
        <h2 class="not-found__title">Page Not Found</h2>
        <p class="not-found__description">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <!-- Action Buttons -->
        <div class="not-found__actions">
          <button @click="goHome" class="btn btn--primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 10L10 3L17 10M10 3V17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back to Home
          </button>
          <button @click="goBack" class="btn btn--secondary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5L7 10L12 15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Go Back
          </button>
        </div>

        <!-- Helpful Links -->
        <div class="not-found__links">
          <p class="not-found__links-title">You might be interested in:</p>
          <div class="not-found__links-list">
            <router-link to="/posts" class="not-found__link">All Posts</router-link>
            <router-link to="/categories" class="not-found__link">Categories</router-link>
            <router-link to="/tags" class="not-found__link">Tags</router-link>
            <router-link to="/about" class="not-found__link">About</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary, #FFFFFF);
  padding: 80px 0;
}

.not-found__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
  width: 100%;
}

.not-found__content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.not-found__icon {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  color: var(--color-primary-600, #7F56D9);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.not-found__code {
  font-size: 120px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-primary-600, #7F56D9);
  margin: 0 0 16px 0;
  line-height: 1;
}

.not-found__title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary, #1A1A1A);
  margin: 0 0 16px 0;
}

.not-found__description {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary, #667085);
  margin: 0 0 48px 0;
}

.not-found__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 64px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 48px;
}

.btn--primary {
  background-color: var(--color-primary-600, #7F56D9);
  color: #FFFFFF;
}

.btn--primary:hover {
  background-color: var(--color-primary-700, #6941C6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
}

.btn--primary:active {
  transform: translateY(0);
}

.btn--secondary {
  background-color: var(--bg-secondary, #F9FAFB);
  color: var(--text-primary, #1A1A1A);
  border: 1px solid var(--color-gray-300, #D0D5DD);
}

.btn--secondary:hover {
  background-color: var(--color-gray-50, #F9FAFB);
  border-color: var(--color-gray-500, #667085);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn--secondary:active {
  transform: translateY(0);
}

.not-found__links {
  padding-top: 48px;
  border-top: 1px solid var(--color-gray-300, #D0D5DD);
}

.not-found__links-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary, #667085);
  margin: 0 0 20px 0;
}

.not-found__links-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.not-found__link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary-600, #7F56D9);
  background-color: var(--color-primary-50, #F9F5FF);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
  min-height: 44px;
}

.not-found__link:hover {
  background-color: var(--color-primary-600, #7F56D9);
  color: #FFFFFF;
  transform: translateY(-2px);
}

/* Dark theme */
[data-theme="dark"] .not-found {
  background: var(--bg-primary, #090D1F);
}

[data-theme="dark"] .not-found__title {
  color: var(--text-primary, #FFFFFF);
}

[data-theme="dark"] .not-found__description {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .btn--secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #FFFFFF);
  border-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .btn--secondary:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

[data-theme="dark"] .not-found__links {
  border-top-color: rgba(255, 255, 255, 0.34);
}

[data-theme="dark"] .not-found__links-title {
  color: var(--text-secondary, #C0C5D0);
}

[data-theme="dark"] .not-found__link {
  background-color: rgba(127, 86, 217, 0.2);
  color: var(--color-primary-600, #7F56D9);
}

[data-theme="dark"] .not-found__link:hover {
  background-color: var(--color-primary-600, #7F56D9);
  color: #FFFFFF;
}

/* Responsive - Tablet */
@media (max-width: 1439px) {
  .not-found__container {
    padding: 0 40px;
  }

  .not-found__code {
    font-size: 100px;
  }

  .not-found__title {
    font-size: 40px;
  }
}

@media (max-width: 834px) {
  .not-found {
    padding: 60px 0;
  }

  .not-found__container {
    padding: 0 24px;
  }

  .not-found__icon svg {
    width: 150px;
    height: 150px;
  }

  .not-found__code {
    font-size: 80px;
  }

  .not-found__title {
    font-size: 32px;
  }

  .not-found__description {
    font-size: 16px;
    margin-bottom: 40px;
  }

  .not-found__actions {
    flex-direction: column;
    margin-bottom: 48px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Responsive - Mobile */
@media (max-width: 390px) {
  .not-found {
    padding: 40px 0;
    min-height: calc(100vh - 60px);
  }

  .not-found__container {
    padding: 0 16px;
  }

  .not-found__icon {
    margin-bottom: 24px;
  }

  .not-found__icon svg {
    width: 120px;
    height: 120px;
  }

  .not-found__code {
    font-size: 64px;
    margin-bottom: 12px;
  }

  .not-found__title {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .not-found__description {
    font-size: 15px;
    margin-bottom: 32px;
  }

  .not-found__actions {
    margin-bottom: 40px;
  }

  .btn {
    padding: 12px 24px;
    font-size: 15px;
  }

  .not-found__links {
    padding-top: 32px;
  }

  .not-found__links-title {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .not-found__links-list {
    gap: 12px;
  }

  .not-found__link {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>
