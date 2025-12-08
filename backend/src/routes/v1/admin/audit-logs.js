const express = require('express');
const router = express.Router();
const auditLogController = require('../../../controllers/auditLogController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

router.use(authenticate);
router.use(requireAdmin);

router.get('/', auditLogController.getAuditLogs);
router.get('/:id', auditLogController.getAuditLog);

module.exports = router;

