const { body, param, query } = require('express-validator');

/**
 * 文章相关的验证规则
 */

/**
 * 创建文章验证
 */
const createPostValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty if provided')
    .isLength({ min: 1, max: 200 })
    .withMessage('Slug must be between 1 and 200 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary must not exceed 500 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('cover_image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('category_id')
    .notEmpty()
    .withMessage('Category is required')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('tag_ids')
    .optional()
    .isArray()
    .withMessage('Tag IDs must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const allIntegers = value.every((id) => Number.isInteger(id) && id > 0);
        if (!allIntegers) {
          throw new Error('All tag IDs must be positive integers');
        }
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),
  body('allow_comments')
    .optional()
    .isBoolean()
    .withMessage('allow_comments must be a boolean'),
  body('published_at')
    .optional()
    .isISO8601()
    .withMessage('published_at must be a valid ISO 8601 date'),
];

/**
 * 更新文章验证
 */
const updatePostValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Slug must be between 1 and 200 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary must not exceed 500 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('cover_image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('tag_ids')
    .optional()
    .isArray()
    .withMessage('Tag IDs must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const allIntegers = value.every((id) => Number.isInteger(id) && id > 0);
        if (!allIntegers) {
          throw new Error('All tag IDs must be positive integers');
        }
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),
  body('allow_comments')
    .optional()
    .isBoolean()
    .withMessage('allow_comments must be a boolean'),
  body('published_at')
    .optional()
    .isISO8601()
    .withMessage('published_at must be a valid ISO 8601 date'),
];

/**
 * 获取文章详情验证
 */
const getPostValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
];

/**
 * 删除文章验证
 */
const deletePostValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
];

/**
 * 获取文章列表验证
 */
const getPostsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('tagId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer'),
  query('authorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Author ID must be a positive integer'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  query('isFeatured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isFeatured must be true or false'),
  query('includeDeleted')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeDeleted must be true or false'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'published_at', 'view_count', 'title'])
    .withMessage('sortBy must be one of: created_at, updated_at, published_at, view_count, title'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder must be ASC or DESC'),
];

/**
 * 搜索文章验证
 */
const searchPostsValidation = [
  query('keyword')
    .trim()
    .notEmpty()
    .withMessage('Search keyword is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Keyword must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createPostValidation,
  updatePostValidation,
  getPostValidation,
  deletePostValidation,
  getPostsValidation,
  searchPostsValidation,
};
