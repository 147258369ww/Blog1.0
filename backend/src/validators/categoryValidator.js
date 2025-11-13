const { body, param, query } = require('express-validator');

/**
 * 分类相关的验证规则
 */

/**
 * 创建分类验证
 */
const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Slug must be between 1 and 50 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent_id')
    .optional()
    .custom((value) => {
      if (value === null || value === '') {
        return true;
      }
      if (!Number.isInteger(value) || value < 1) {
        throw new Error('Parent ID must be a positive integer or null');
      }
      return true;
    }),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

/**
 * 更新分类验证
 */
const updateCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Slug must be between 1 and 50 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent_id')
    .optional()
    .custom((value) => {
      if (value === null || value === '') {
        return true;
      }
      if (!Number.isInteger(value) || value < 1) {
        throw new Error('Parent ID must be a positive integer or null');
      }
      return true;
    }),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

/**
 * 获取分类详情验证
 */
const getCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
];

/**
 * 删除分类验证
 */
const deleteCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
];

/**
 * 获取分类列表验证
 */
const getCategoriesValidation = [
  query('keyword')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Keyword must be between 1 and 100 characters'),
  query('parentId')
    .optional()
    .custom((value) => {
      if (value === 'null') {
        return true;
      }
      const num = parseInt(value, 10);
      if (!Number.isInteger(num) || num < 1) {
        throw new Error('Parent ID must be a positive integer or "null"');
      }
      return true;
    }),
  query('includeChildren')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeChildren must be true or false'),
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryValidation,
  deleteCategoryValidation,
  getCategoriesValidation,
};
