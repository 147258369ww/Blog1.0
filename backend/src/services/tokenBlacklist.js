const crypto = require('crypto');
const { redisClient } = require('../config/redis');
const memorySet = new Set();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addToMemory(token, ttlSeconds) {
  try {
    const key = hashToken(token);
    memorySet.add(key);
    const ttl = Math.max(0, parseInt(ttlSeconds, 10) || 0);
    if (ttl > 0) {
      setTimeout(() => memorySet.delete(key), ttl * 1000).unref?.();
    }
  } catch (_) {}
}

async function add(token, ttlSeconds) {
  try {
    const key = `blacklist:${hashToken(token)}`;
    const ttl = Math.max(0, parseInt(ttlSeconds, 10) || 0);
    addToMemory(token, ttl);
    if (ttl > 0) {
      await redisClient.setEx(key, ttl, '1');
    } else {
      await redisClient.set(key, '1');
    }
    return true;
  } catch (_) {
    return false;
  }
}

function isBlacklistedSync(token) {
  try {
    return memorySet.has(hashToken(token));
  } catch (_) {
    return false;
  }
}

async function isBlacklisted(token) {
  try {
    const key = `blacklist:${hashToken(token)}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (_) {
    return false;
  }
}

module.exports = {
  add,
  addToMemory,
  isBlacklisted,
  isBlacklistedSync,
  hashToken,
};

