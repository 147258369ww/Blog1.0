const { body, param, query } = require('express-validator');

/**
 * 标签相关的验证规则
 */

/**
 * 创建标签验证
 */
const createTagValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 30 })
    .withMessage('Name must be between 1 and 30 characters'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ min: 1, max: 30 })
    .withMessage('Slug must be between 1 and 30 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)'),
];

/**
 * 更新标签验证
 */
const updateTagValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 30 })
    .withMessage('Name must be between 1 and 30 characters'),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty')
    .isLength({ min: 1, max: 30 })
    .withMessage('Slug must be between 1 and 30 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)'),
];

/**
 * 获取标签详情验证
 */
const getTagValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer'),
];

/**
 * 删除标签验证
 */
const deleteTagValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer'),
];

/**
 * 获取标签列表验证
 */
const getTagsValidation = [
  query('keyword')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Keyword must be between 1 and 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['name', 'created_at', 'updated_at'])
    .withMessage('sortBy must be one of: name, created_at, updated_at'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder must be ASC or DESC'),
];

/**
 * 搜索标签验证
 */
const searchTagsValidation = [
  query('keyword')
    .trim()
    .notEmpty()
    .withMessage('Search keyword is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Keyword must be between 1 and 100 characters'),
];

/**
 * 获取热门标签验证
 */
const getPopularTagsValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

module.exports = {
  createTagValidation,
  updateTagValidation,
  getTagValidation,
  deleteTagValidation,
  getTagsValidation,
  searchTagsValidation,
  getPopularTagsValidation,
};
