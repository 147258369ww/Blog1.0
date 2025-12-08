const express = require('express');
const router = express.Router();
const systemLogController = require('../../../controllers/systemLogController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

router.use(authenticate);
router.use(requireAdmin);

router.get('/', systemLogController.listLogs);
router.get('/:name', systemLogController.getLog);
router.get('/:name/download', systemLogController.downloadLog);
router.delete('/:name', systemLogController.clearLog);

module.exports = router;

