'use strict';

const { redisClient } = require('../config/redis');
const ModelScopeProvider = require('../llm/modelscopeProvider');
const geoip = require('geoip-lite');

const provider = new ModelScopeProvider({});

function isChinese(str) {
  if (!str || typeof str !== 'string') return false;
  return /[\p{Script=Han}]/u.test(str);
}

async function localizePlace(place) {
  if (!place || typeof place !== 'string') return null;
  const p1 = `请将地点名称转换为简体中文常用地名，仅返回中文名称，不要附加说明：${place}`;
  let out = await provider.infer(p1, {});
  let t = typeof out === 'string' ? String(out).trim() : String(JSON.stringify(out)).trim();
  if (isChinese(t)) return t;
  const p2 = `请只输出该地点的简体中文名称，严格禁止英文、拼音或任何解释：${place}`;
  out = await provider.infer(p2, {});
  t = typeof out === 'string' ? String(out).trim() : String(JSON.stringify(out)).trim();
  if (isChinese(t)) return t;
  const p3 = `将“${place}”翻译为中文地名，仅输出中文，不含其他字符。`;
  out = await provider.infer(p3, {});
  t = typeof out === 'string' ? String(out).trim() : String(JSON.stringify(out)).trim();
  if (isChinese(t)) return t;
  return place;
}

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf && typeof xf === 'string') {
    const parts = xf.split(',');
    if (parts.length > 0) return parts[0].trim();
  }
  if (req.headers['x-real-ip']) return String(req.headers['x-real-ip']);
  if (req.ip) return String(req.ip);
  if (req.connection && req.connection.remoteAddress) return String(req.connection.remoteAddress);
  return 'unknown';
}

function resolveCity(ip) {
  try {
    const g = geoip.lookup(ip);
    if (!g) return null;
    const city = g.city || null;
    const region = g.region || null;
    const country = g.country || null;
    if (city) return city;
    if (region) return region;
    if (country) return country;
    return null;
  } catch (_) {
    return null;
  }
}

function buildContext(req) {
  const ip = getClientIp(req);
  const ua = req.get('User-Agent') || 'unknown';
  const referer = req.get('Referer') || 'direct';
  const path = req.originalUrl || req.url || '/';
  const method = req.method || 'GET';
  const city = resolveCity(ip);
  const ts = Date.now();
  return { ip, ua, referer, path, method, city, ts };
}

async function classifyIntent(context) {
  const categories = ['reading', 'searching', 'learning', 'browsing', 'mobile'];
  const payload = {
    model: process.env.MODEL_MODEL_ID || undefined,
    input: {
      task: 'classify_intent',
      categories,
      context,
    },
  };
  const prompt = JSON.stringify(payload);
  const out = await provider.infer(prompt, {});
  if (!out) return { intent: 'browsing', confidence: 0.0 };
  try {
    const parsed = typeof out === 'string' ? JSON.parse(out) : out;
    const intent = parsed.intent && categories.includes(parsed.intent) ? parsed.intent : 'browsing';
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;
    return { intent, confidence };
  } catch (_) {
    return { intent: 'browsing', confidence: 0.3 };
  }
}

function generateGreeting(city, intent) {
  return Promise.resolve().then(async () => {
    if (city && typeof city === 'string' && city.trim().length > 0) {
      const zh = await localizePlace(city);
      if (zh && zh.trim().length > 0) {
        return `欢迎${zh}的朋友访问！`;
      }
    }
    if (intent === 'learning') return '欢迎热爱学习的朋友访问！';
    return '欢迎访问！';
  });
}

async function getGreeting(req) {
  const ctx = buildContext(req);
  const cacheKey = `intent:greeting:${ctx.ip}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (_) {}
  const ci = await classifyIntent(ctx);
  let message;
  if (req.intentDailyExceeded) {
    const place = ctx.city && typeof ctx.city === 'string' && ctx.city.trim().length > 0 ? ctx.city : null;
    message = place ? `Welcome ${place}!` : 'Welcome!';
  } else {
    message = await generateGreeting(ctx.city, ci.intent);
  }
  const result = { message, intent: ci.intent };
  try {
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 600 });
  } catch (_) {}
  return result;
}

async function analyze(req) {
  const ctx = buildContext(req);
  const ci = await classifyIntent(ctx);
  return { intent: ci.intent, confidence: ci.confidence, context: ctx };
}

module.exports = {
  getGreeting,
  analyze,
};
