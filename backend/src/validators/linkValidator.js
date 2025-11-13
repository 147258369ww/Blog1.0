const { body, param, query } = require('express-validator');

/**
 * 友链相关的验证规则
 */

/**
 * 创建友链验证
 */
const createLinkValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('URL must be a valid HTTP or HTTPS URL'),
  body('logo')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Logo must be a valid HTTP or HTTPS URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

/**
 * 更新友链验证
 */
const updateLinkValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('url')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('URL cannot be empty')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('URL must be a valid HTTP or HTTPS URL'),
  body('logo')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Logo must be a valid HTTP or HTTPS URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

/**
 * 获取友链详情验证
 */
const getLinkValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer'),
];

/**
 * 删除友链验证
 */
const deleteLinkValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer'),
];

/**
 * 获取友链列表验证
 */
const getLinksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  query('sortBy')
    .optional()
    .isIn(['sort_order', 'name', 'created_at', 'updated_at'])
    .withMessage('sortBy must be one of: sort_order, name, created_at, updated_at'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder must be ASC or DESC'),
];

module.exports = {
  createLinkValidation,
  updateLinkValidation,
  getLinkValidation,
  deleteLinkValidation,
  getLinksValidation,
};
