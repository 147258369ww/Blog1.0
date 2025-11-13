# API 文档

## 基础信息

- 基础 URL: `http://localhost:3000/api/v1`
- 认证方式: Bearer Token (JWT)
- 响应格式: JSON

## 公开接口

### 认证 (Auth)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 发送注册验证码 | POST | `/auth/register` | ❌ |
| 验证码注册 | POST | `/auth/verify` | ❌ |
| 用户登录 | POST | `/auth/login` | ❌ |
| 刷新令牌 | POST | `/auth/refresh` | ❌ |
| 用户登出 | POST | `/auth/logout` | ✅ |
| 修改密码 | PUT | `/auth/password` | ✅ |

### 文章 (Posts)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 搜索文章 | GET | `/posts/search?keyword={keyword}` | ❌ |
| 获取文章列表 | GET | `/posts?page=1&limit=10` | ❌ |
| 获取文章详情 | GET | `/posts/{id}` | ❌ |

### 分类 (Categories)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 获取分类树 | GET | `/categories/tree` | ❌ |
| 获取分类列表 | GET | `/categories` | ❌ |
| 获取分类详情 | GET | `/categories/{id}` | ❌ |
| 获取分类下的文章 | GET | `/categories/{id}/posts` | ❌ |

### 标签 (Tags)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 获取热门标签 | GET | `/tags/popular?limit=10` | ❌ |
| 搜索标签 | GET | `/tags/search?keyword={keyword}` | ❌ |
| 获取标签列表 | GET | `/tags` | ❌ |
| 获取标签详情 | GET | `/tags/{id}` | ❌ |
| 获取标签下的文章 | GET | `/tags/{id}/posts` | ❌ |

### 友情链接 (Links)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 获取活跃友链 | GET | `/links` | ❌ |

### 统计 (Stats)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 获取博客统计 | GET | `/stats` | ❌ |
| 获取文章统计 | GET | `/stats/posts` | ❌ |
| 增加文章浏览量 | POST | `/stats/post/{id}/view` | ❌ |

---

## 管理员接口

> 所有管理员接口需要 Bearer Token 认证，且用户角色必须为 `admin`

### 文章管理 (Admin - Posts)

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取所有文章 | GET | `/admin/posts?page=1&limit=10` | 包括草稿、已发布、已归档 |
| 获取文章详情 | GET | `/admin/posts/{id}` | 包括草稿和已删除 |
| 创建文章 | POST | `/admin/posts` | 可设置为草稿或发布 |
| 更新文章 | PUT | `/admin/posts/{id}` | 更新文章信息 |
| 删除文章 | DELETE | `/admin/posts/{id}` | 软删除，可恢复 |
| 更新文章状态 | PATCH | `/admin/posts/{id}/status` | 修改状态 |
| 恢复已删除文章 | POST | `/admin/posts/{id}/restore` | 恢复软删除的文章 |

### 分类管理 (Admin - Categories)

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取分类列表 | GET | `/admin/categories` | 所有分类 |
| 获取分类树 | GET | `/admin/categories/tree` | 层级结构 |
| 获取分类详情 | GET | `/admin/categories/{id}` | 单个分类 |
| 创建分类 | POST | `/admin/categories` | 新建分类 |
| 更新分类 | PUT | `/admin/categories/{id}` | 更新信息 |
| 删除分类 | DELETE | `/admin/categories/{id}` | 需检查关联文章 |
| 更新分类排序 | PUT | `/admin/categories/sort` | 批量更新排序 |

### 标签管理 (Admin - Tags)

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取标签列表 | GET | `/admin/tags` | 所有标签 |
| 获取标签详情 | GET | `/admin/tags/{id}` | 单个标签 |
| 创建标签 | POST | `/admin/tags` | 新建标签 |
| 更新标签 | PUT | `/admin/tags/{id}` | 更新信息 |
| 删除标签 | DELETE | `/admin/tags/{id}` | 需检查关联文章 |

### 文件管理 (Admin - Files)

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 上传文件 | POST | `/admin/files/upload` | multipart/form-data |
| 获取文件列表 | GET | `/admin/files?page=1&limit=20` | 支持筛选 |
| 获取文件详情 | GET | `/admin/files/{id}` | 单个文件 |
| 删除文件 | DELETE | `/admin/files/{id}` | 删除文件 |

### 友链管理 (Admin - Links)

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取友链列表 | GET | `/admin/links` | 所有友链 |
| 获取友链详情 | GET | `/admin/links/{id}` | 单个友链 |
| 创建友链 | POST | `/admin/links` | 新建友链 |
| 更新友链 | PUT | `/admin/links/{id}` | 更新信息 |
| 删除友链 | DELETE | `/admin/links/{id}` | 删除友链 |

### 系统配置 (Admin - Config)

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取所有配置 | GET | `/admin/config` | 系统配置列表 |
| 获取单个配置 | GET | `/admin/config/{key}` | 根据 key 获取 |
| 更新配置 | PUT | `/admin/config/{key}` | 更新配置值 |
| 批量更新配置 | PUT | `/admin/config/batch` | 批量更新 |

---

## 请求示例

### 注册用户

```bash
# 1. 发送验证码
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com"
}

# 2. 验证并注册
POST /api/v1/auth/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "username": "johndoe",
  "password": "Password123",
  "nickname": "John Doe"
}
```

### 用户登录

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}

# 响应
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### 创建文章（管理员）

```bash
POST /api/v1/admin/posts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "我的第一篇博客",
  "slug": "my-first-blog",
  "summary": "这是我的第一篇博客文章",
  "content": "# 标题\n\n这是内容...",
  "cover_image": "/uploads/images/cover.jpg",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "status": "published",
  "is_featured": false,
  "allow_comments": true
}
```

### 上传文件（管理员）

```bash
POST /api/v1/admin/files/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary data]
```

---

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 分页响应

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "message": "错误信息",
    "code": "ERROR_CODE"
  }
}
```

---

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 文章状态

- `draft` - 草稿
- `published` - 已发布
- `archived` - 已归档

## 文件类型

- `image` - 图片（最大 5MB）
- `document` - 文档（最大 10MB）
- `other` - 其他（最大 10MB）

## 友链状态

- `active` - 活跃
- `inactive` - 停用
