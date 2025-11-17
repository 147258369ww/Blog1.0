'use strict';

const express = require('express');
const router = express.Router();
const RateLimitMiddleware = require('../../middlewares/rateLimit');
const intentService = require('../../services/intentService');

router.get('/greeting', RateLimitMiddleware.intentQuota(), async (req, res) => {
  try {
    const data = await intentService.getGreeting(req);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } });
  }
});

router.get('/analyze', RateLimitMiddleware.intentQuota(), async (req, res) => {
  try {
    const data = await intentService.analyze(req);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } });
  }
});

module.exports = router;