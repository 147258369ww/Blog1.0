<template>
  <div class="style-guide">
    <div class="style-guide__header">
      <h1 class="font-3xl font-bold">设计系统样式指南</h1>
      <p class="text-secondary mt-2">博客后台管理系统的设计规范和组件示例</p>
    </div>

    <!-- 颜色系统 -->
    <section class="style-guide__section">
      <h2 class="section-title">颜色系统</h2>

      <div class="subsection">
        <h3 class="subsection-title">主题色</h3>
        <div class="color-grid">
          <div class="color-item">
            <div class="color-box" style="background-color: #409eff"></div>
            <div class="color-info">
              <div class="color-name">Primary</div>
              <div class="color-value">#409eff</div>
            </div>
          </div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">功能色</h3>
        <div class="color-grid">
          <div class="color-item">
            <div class="color-box" style="background-color: #67c23a"></div>
            <div class="color-info">
              <div class="color-name">Success</div>
              <div class="color-value">#67c23a</div>
            </div>
          </div>
          <div class="color-item">
            <div class="color-box" style="background-color: #e6a23c"></div>
            <div class="color-info">
              <div class="color-name">Warning</div>
              <div class="color-value">#e6a23c</div>
            </div>
          </div>
          <div class="color-item">
            <div class="color-box" style="background-color: #f56c6c"></div>
            <div class="color-info">
              <div class="color-name">Danger</div>
              <div class="color-value">#f56c6c</div>
            </div>
          </div>
          <div class="color-item">
            <div class="color-box" style="background-color: #909399"></div>
            <div class="color-info">
              <div class="color-name">Info</div>
              <div class="color-value">#909399</div>
            </div>
          </div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">文本色</h3>
        <div class="color-grid">
          <div class="color-item">
            <div class="color-box" style="background-color: #303133"></div>
            <div class="color-info">
              <div class="color-name">Primary</div>
              <div class="color-value">#303133</div>
            </div>
          </div>
          <div class="color-item">
            <div class="color-box" style="background-color: #606266"></div>
            <div class="color-info">
              <div class="color-name">Regular</div>
              <div class="color-value">#606266</div>
            </div>
          </div>
          <div class="color-item">
            <div class="color-box" style="background-color: #909399"></div>
            <div class="color-info">
              <div class="color-name">Secondary</div>
              <div class="color-value">#909399</div>
            </div>
          </div>
          <div class="color-item">
            <div class="color-box" style="background-color: #c0c4cc"></div>
            <div class="color-info">
              <div class="color-name">Placeholder</div>
              <div class="color-value">#c0c4cc</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 字体系统 -->
    <section class="style-guide__section">
      <h2 class="section-title">字体系统</h2>

      <div class="subsection">
        <h3 class="subsection-title">字体大小</h3>
        <div class="typography-list">
          <div class="typography-item">
            <div class="font-xs">超小文本 (12px)</div>
            <div class="typography-meta">font-xs / 12px</div>
          </div>
          <div class="typography-item">
            <div class="font-sm">小文本 (14px)</div>
            <div class="typography-meta">font-sm / 14px</div>
          </div>
          <div class="typography-item">
            <div class="font-base">基础文本 (16px)</div>
            <div class="typography-meta">font-base / 16px</div>
          </div>
          <div class="typography-item">
            <div class="font-lg">大文本 (18px)</div>
            <div class="typography-meta">font-lg / 18px</div>
          </div>
          <div class="typography-item">
            <div class="font-xl">超大文本 (20px)</div>
            <div class="typography-meta">font-xl / 20px</div>
          </div>
          <div class="typography-item">
            <div class="font-2xl">特大文本 (24px)</div>
            <div class="typography-meta">font-2xl / 24px</div>
          </div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">字体粗细</h3>
        <div class="typography-list">
          <div class="typography-item">
            <div class="font-normal">正常粗细 (400)</div>
            <div class="typography-meta">font-normal / 400</div>
          </div>
          <div class="typography-item">
            <div class="font-medium">中等粗细 (500)</div>
            <div class="typography-meta">font-medium / 500</div>
          </div>
          <div class="typography-item">
            <div class="font-semibold">半粗体 (600)</div>
            <div class="typography-meta">font-semibold / 600</div>
          </div>
          <div class="typography-item">
            <div class="font-bold">粗体 (700)</div>
            <div class="typography-meta">font-bold / 700</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 间距系统 -->
    <section class="style-guide__section">
      <h2 class="section-title">间距系统</h2>
      <div class="spacing-list">
        <div class="spacing-item">
          <div class="spacing-box" style="width: 4px"></div>
          <div class="spacing-info">
            <div class="spacing-name">spacing-1 (xs)</div>
            <div class="spacing-value">4px</div>
          </div>
        </div>
        <div class="spacing-item">
          <div class="spacing-box" style="width: 8px"></div>
          <div class="spacing-info">
            <div class="spacing-name">spacing-2 (sm)</div>
            <div class="spacing-value">8px</div>
          </div>
        </div>
        <div class="spacing-item">
          <div class="spacing-box" style="width: 12px"></div>
          <div class="spacing-info">
            <div class="spacing-name">spacing-3</div>
            <div class="spacing-value">12px</div>
          </div>
        </div>
        <div class="spacing-item">
          <div class="spacing-box" style="width: 16px"></div>
          <div class="spacing-info">
            <div class="spacing-name">spacing-4 (md)</div>
            <div class="spacing-value">16px</div>
          </div>
        </div>
        <div class="spacing-item">
          <div class="spacing-box" style="width: 24px"></div>
          <div class="spacing-info">
            <div class="spacing-name">spacing-6 (lg)</div>
            <div class="spacing-value">24px</div>
          </div>
        </div>
        <div class="spacing-item">
          <div class="spacing-box" style="width: 32px"></div>
          <div class="spacing-info">
            <div class="spacing-name">spacing-8 (xl)</div>
            <div class="spacing-value">32px</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 圆角系统 -->
    <section class="style-guide__section">
      <h2 class="section-title">圆角系统</h2>
      <div class="radius-list">
        <div class="radius-item">
          <div class="radius-box rounded-none"></div>
          <div class="radius-info">
            <div class="radius-name">none</div>
            <div class="radius-value">0</div>
          </div>
        </div>
        <div class="radius-item">
          <div class="radius-box rounded-sm"></div>
          <div class="radius-info">
            <div class="radius-name">sm</div>
            <div class="radius-value">2px</div>
          </div>
        </div>
        <div class="radius-item">
          <div class="radius-box rounded"></div>
          <div class="radius-info">
            <div class="radius-name">base</div>
            <div class="radius-value">4px</div>
          </div>
        </div>
        <div class="radius-item">
          <div class="radius-box rounded-md"></div>
          <div class="radius-info">
            <div class="radius-name">md</div>
            <div class="radius-value">6px</div>
          </div>
        </div>
        <div class="radius-item">
          <div class="radius-box rounded-lg"></div>
          <div class="radius-info">
            <div class="radius-name">lg</div>
            <div class="radius-value">8px</div>
          </div>
        </div>
        <div class="radius-item">
          <div class="radius-box rounded-xl"></div>
          <div class="radius-info">
            <div class="radius-name">xl</div>
            <div class="radius-value">12px</div>
          </div>
        </div>
        <div class="radius-item">
          <div class="radius-box rounded-full"></div>
          <div class="radius-info">
            <div class="radius-name">full</div>
            <div class="radius-value">9999px</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 阴影系统 -->
    <section class="style-guide__section">
      <h2 class="section-title">阴影系统</h2>
      <div class="shadow-list">
        <div class="shadow-item">
          <div class="shadow-box shadow-sm"></div>
          <div class="shadow-info">
            <div class="shadow-name">sm</div>
            <div class="shadow-value">轻微阴影</div>
          </div>
        </div>
        <div class="shadow-item">
          <div class="shadow-box shadow"></div>
          <div class="shadow-info">
            <div class="shadow-name">base</div>
            <div class="shadow-value">基础阴影</div>
          </div>
        </div>
        <div class="shadow-item">
          <div class="shadow-box shadow-md"></div>
          <div class="shadow-info">
            <div class="shadow-name">md</div>
            <div class="shadow-value">中等阴影</div>
          </div>
        </div>
        <div class="shadow-item">
          <div class="shadow-box shadow-lg"></div>
          <div class="shadow-info">
            <div class="shadow-name">lg</div>
            <div class="shadow-value">大阴影</div>
          </div>
        </div>
        <div class="shadow-item">
          <div class="shadow-box shadow-xl"></div>
          <div class="shadow-info">
            <div class="shadow-name">xl</div>
            <div class="shadow-value">超大阴影</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 按钮组件 -->
    <section class="style-guide__section">
      <h2 class="section-title">按钮组件</h2>
      <div class="component-demo">
        <div class="demo-row">
          <el-button type="primary">主要按钮</el-button>
          <el-button type="success">成功按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
          <el-button type="info">信息按钮</el-button>
        </div>
        <div class="demo-row">
          <el-button type="primary" plain>朴素按钮</el-button>
          <el-button type="primary" round>圆角按钮</el-button>
          <el-button type="primary" circle icon="Plus"></el-button>
          <el-button type="primary" :icon="Plus">图标按钮</el-button>
        </div>
        <div class="demo-row">
          <el-button size="large">大按钮</el-button>
          <el-button>默认按钮</el-button>
          <el-button size="small">小按钮</el-button>
        </div>
      </div>
    </section>

    <!-- 表单组件 -->
    <section class="style-guide__section">
      <h2 class="section-title">表单组件</h2>
      <div class="component-demo">
        <el-form :model="form" label-width="100px" style="max-width: 600px">
          <el-form-item label="输入框">
            <el-input v-model="form.input" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="选择器">
            <el-select v-model="form.select" placeholder="请选择">
              <el-option label="选项1" value="1" />
              <el-option label="选项2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期选择">
            <el-date-picker v-model="form.date" type="date" placeholder="选择日期" />
          </el-form-item>
          <el-form-item label="开关">
            <el-switch v-model="form.switch" />
          </el-form-item>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const form = reactive({
  input: '',
  select: '',
  date: '',
  switch: false,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
@use '@/assets/styles/mixins.scss' as *;

.style-guide {
  padding: $spacing-8;
  max-width: 1400px;
  margin: 0 auto;

  @include mobile {
    padding: $spacing-4;
  }

  &__header {
    margin-bottom: $spacing-8;
    padding-bottom: $spacing-6;
    border-bottom: 2px solid $border-lighter;
  }

  &__section {
    margin-bottom: $spacing-12;
  }
}

.section-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-6;
}

.subsection {
  margin-bottom: $spacing-8;

  &-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-4;
  }
}

// 颜色网格
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: $spacing-4;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.color-box {
  height: 80px;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-base;
}

.color-info {
  .color-name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .color-value {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-family: $font-family-mono;
  }
}

// 字体列表
.typography-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.typography-item {
  padding: $spacing-4;
  background-color: $background-white;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-sm;

  .typography-meta {
    margin-top: $spacing-2;
    font-size: $font-size-sm;
    color: $text-secondary;
    font-family: $font-family-mono;
  }
}

// 间距列表
.spacing-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.spacing-item {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  background-color: $background-white;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-sm;
}

.spacing-box {
  height: 40px;
  background-color: $primary-color;
  border-radius: $border-radius-base;
}

.spacing-info {
  .spacing-name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .spacing-value {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-family: $font-family-mono;
  }
}

// 圆角列表
.radius-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: $spacing-4;
}

.radius-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-4;
  background-color: $background-white;
  box-shadow: $box-shadow-sm;
  border-radius: $border-radius-lg;
}

.radius-box {
  width: 60px;
  height: 60px;
  background-color: $primary-color;
}

.radius-info {
  text-align: center;

  .radius-name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .radius-value {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-family: $font-family-mono;
  }
}

// 阴影列表
.shadow-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: $spacing-6;
}

.shadow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
}

.shadow-box {
  width: 100px;
  height: 100px;
  background-color: $background-white;
  border-radius: $border-radius-lg;
}

.shadow-info {
  text-align: center;

  .shadow-name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .shadow-value {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

// 组件演示
.component-demo {
  padding: $spacing-6;
  background-color: $background-white;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-base;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
