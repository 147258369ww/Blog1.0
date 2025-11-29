<template>
  <div class="editor-demo">
    <el-card header="富文本编辑器演示">
      <el-form :model="form" label-width="100px">
        <el-form-item label="文章标题">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="文章内容">
          <RichTextEditor
            v-model="form.content"
            placeholder="请输入文章内容..."
            :height="500"
            @change="handleContentChange"
          />
        </el-form-item>

        <el-form-item label="只读模式">
          <el-switch v-model="readonly" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleLoadSample">加载示例内容</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card header="预览" style="margin-top: 20px">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="preview-content" v-html="form.content"></div>
    </el-card>

    <el-card header="HTML 源码" style="margin-top: 20px">
      <el-input v-model="form.content" type="textarea" :rows="10" readonly />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RichTextEditor } from '@/components/editor'
import { ElMessage } from 'element-plus'

const form = reactive({
  title: '',
  content: '',
})

const readonly = ref(false)

const handleContentChange = (value: string) => {
  console.log('Content changed:', value)
}

const handleSubmit = () => {
  if (!form.title) {
    ElMessage.warning('请输入文章标题')
    return
  }

  if (!form.content) {
    ElMessage.warning('请输入文章内容')
    return
  }

  console.log('提交表单:', form)
  ElMessage.success('提交成功')
}

const handleReset = () => {
  form.title = ''
  form.content = ''
  ElMessage.info('已重置')
}

const handleLoadSample = () => {
  form.title = '示例文章标题'
  form.content = `
    <h1>这是一级标题</h1>
    <p>这是一段普通文本。</p>
    
    <h2>这是二级标题</h2>
    <p>这是另一段文本，包含<strong>加粗</strong>、<em>斜体</em>和<u>下划线</u>。</p>
    
    <h3>列表示例</h3>
    <ul>
      <li>无序列表项 1</li>
      <li>无序列表项 2</li>
      <li>无序列表项 3</li>
    </ul>
    
    <ol>
      <li>有序列表项 1</li>
      <li>有序列表项 2</li>
      <li>有序列表项 3</li>
    </ol>
    
    <h3>代码示例</h3>
    <p>这是行内代码：<code>const hello = 'world'</code></p>
    
    <pre>// 这是代码块
function greet(name) {
  console.log('Hello, ' + name);
}
greet('World');</pre>
    
    <h3>链接和引用</h3>
    <p>这是一个<a href="https://example.com" target="_blank">链接示例</a>。</p>
    
    <blockquote>这是一段引用文本。</blockquote>
  `
  ElMessage.success('已加载示例内容')
}
</script>

<style lang="scss" scoped>
.editor-demo {
  padding: 20px;

  .preview-content {
    padding: 16px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    min-height: 200px;
    background: #fff;
    line-height: 1.6;

    :deep(h1) {
      font-size: 2em;
      margin: 0.67em 0;
    }
    :deep(h2) {
      font-size: 1.5em;
      margin: 0.75em 0;
    }
    :deep(h3) {
      font-size: 1.17em;
      margin: 0.83em 0;
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 1.5em;
    }

    :deep(pre) {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
    }

    :deep(code) {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }

    :deep(a) {
      color: var(--el-color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(blockquote) {
      border-left: 4px solid var(--el-color-primary);
      padding-left: 16px;
      margin: 16px 0;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
