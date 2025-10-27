const redis = require('redis');
require('dotenv').config();

// Redis client configuration
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  legacyMode: false,
});

// Redis event handlers
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('❌ Redis Connection Error:', error.message);
    return false;
  }
};

/**
 * Cache utility functions
 */
const cache = {
  /**
   * Get cached value by key
   */
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Set cache value with TTL
   */
  set: async (key, value, ttl = parseInt(process.env.CACHE_TTL) || 300) => {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Delete cache key
   */
  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error.message);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  delPattern: async (pattern) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache DEL pattern error for ${pattern}:`, error.message);
      return false;
    }
  },

  /**
   * Increment counter
   */
  incr: async (key) => {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key) => {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error.message);
      return false;
    }
  },
};

module.exports = {
  redisClient,
  connectRedis,
  cache,
};
