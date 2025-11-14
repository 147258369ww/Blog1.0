const express = require('express');
const router = express.Router();
const RateLimitMiddleware = require('../../middlewares/rateLimit');

// 公开路由
const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const categoriesRoutes = require('./categories');
const tagsRoutes = require('./tags');
const linksRoutes = require('./links');
const statsRoutes = require('./stats');
const settingsRoutes = require('./settings');

// 管理员路由
const adminAuthRoutes = require('./admin/auth');
const adminPostsRoutes = require('./admin/posts');
const adminCategoriesRoutes = require('./admin/categories');
const adminTagsRoutes = require('./admin/tags');
const adminFilesRoutes = require('./admin/files');
const adminLinksRoutes = require('./admin/links');
const adminConfigRoutes = require('./admin/config');

// 注册公开路由
router.use('/auth', authRoutes);
router.use('/posts', RateLimitMiddleware.api(), postsRoutes);
router.use('/categories', RateLimitMiddleware.api(), categoriesRoutes);
router.use('/tags', RateLimitMiddleware.api(), tagsRoutes);
router.use('/links', RateLimitMiddleware.api(), linksRoutes);
router.use('/stats', RateLimitMiddleware.api(), statsRoutes);
router.use('/settings', RateLimitMiddleware.api(), settingsRoutes);

// 注册管理员路由
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/posts', RateLimitMiddleware.api(), adminPostsRoutes);
router.use('/admin/categories', RateLimitMiddleware.api(), adminCategoriesRoutes);
router.use('/admin/tags', RateLimitMiddleware.api(), adminTagsRoutes);
router.use('/admin/files', RateLimitMiddleware.api(), adminFilesRoutes);
router.use('/admin/links', RateLimitMiddleware.api(), adminLinksRoutes);
router.use('/admin/config', RateLimitMiddleware.api(), adminConfigRoutes);

module.exports = router;
