const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

// 构建服务器 URL
const protocol = config.https.enabled ? 'https' : 'http';
const serverUrl = process.env.SERVER_URL || `${protocol}://localhost:${config.port}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API Documentation',
      version: '1.0.0',
      description: '博客后端 API 系统文档 - 提供完整的博客管理功能，包括用户认证、文章管理、分类标签、文件上传、搜索等功能',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: config.env === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 访问令牌认证。在请求头中添加: Authorization: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
                message: {
                  type: 'string',
                  example: '错误信息',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: '未授权 - 缺少或无效的访问令牌',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: '未授权访问',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: '禁止访问 - 权限不足',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: '权限不足',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: '资源不存在',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: '资源不存在',
                },
              },
            },
          },
        },
        ValidationError: {
          description: '验证错误 - 请求参数不符合要求',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: '验证失败',
                  details: [
                    {
                      field: 'email',
                      message: '邮箱格式不正确',
                    },
                  ],
                },
              },
            },
          },
        },
        ServerError: {
          description: '服务器内部错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'INTERNAL_ERROR',
                  message: '服务器内部错误',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: '用户认证相关接口',
      },
      {
        name: 'Posts',
        description: '文章相关接口（公开）',
      },
      {
        name: 'Categories',
        description: '分类相关接口（公开）',
      },
      {
        name: 'Tags',
        description: '标签相关接口（公开）',
      },
      {
        name: 'Links',
        description: '友情链接相关接口（公开）',
      },
      {
        name: 'Stats',
        description: '统计相关接口（公开）',
      },
      {
        name: 'Intent',
        description: '用户动机与问候接口',
      },
      {
        name: 'Admin - Posts',
        description: '文章管理接口（管理员）',
      },
      {
        name: 'Admin - Categories',
        description: '分类管理接口（管理员）',
      },
      {
        name: 'Admin - Tags',
        description: '标签管理接口（管理员）',
      },
      {
        name: 'Admin - Files',
        description: '文件管理接口（管理员）',
      },
      {
        name: 'Admin - Links',
        description: '友情链接管理接口（管理员）',
      },
      {
        name: 'Admin - Config',
        description: '系统配置管理接口（管理员）',
      },
    ],
  },
  apis: ['./src/routes/v1/**/*.js'], // 扫描所有路由文件
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
