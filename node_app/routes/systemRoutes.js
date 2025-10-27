/**
 * System Routes
 * Health check and metrics endpoints
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { redisClient } = require('../config/redis');
const HealthCheckService = require('../services/healthCheckService');
const { cache } = require('../config/redis');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /health
 * Application health check
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check MySQL
    try {
      await pool.query('SELECT 1');
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check Redis
    try {
      await redisClient.ping();
      health.services.redis = 'healthy';
    } catch (error) {
      health.services.redis = 'unhealthy';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  })
);

/**
 * GET /metrics
 * Basic metrics about checks performed
 */
router.get(
  '/metrics',
  asyncHandler(async (req, res) => {
    // Try to get from cache
    const cachedMetrics = await cache.get('service_metrics');

    if (cachedMetrics) {
      return res.json({
        success: true,
        cached: true,
        data: cachedMetrics,
      });
    }

    // Calculate metrics
    const metrics = await HealthCheckService.updateMetrics();

    res.json({
      success: true,
      cached: false,
      data: metrics,
    });
  })
);

/**
 * POST /check-all
 * Trigger health checks for all services
 */
router.post(
  '/check-all',
  asyncHandler(async (req, res) => {
    const results = await HealthCheckService.checkAllServices();

    res.json({
      success: true,
      message: 'Health checks completed',
      data: results,
    });
  })
);

module.exports = router;
