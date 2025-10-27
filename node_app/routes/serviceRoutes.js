/**
 * Service Routes
 * Handles all service-related endpoints
 */

const express = require('express');
const router = express.Router();
const ServiceModel = require('../models/serviceModel');
const HealthCheckService = require('../services/healthCheckService');
const { cache } = require('../config/redis');
const {
  validateServiceCreation,
  validateServiceUpdate,
  validateServiceId,
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /services
 * List all monitored services with current status
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Try to get from cache
    const cacheKey = 'service_list';
    const cachedList = await cache.get(cacheKey);

    if (cachedList) {
      return res.json({
        success: true,
        cached: true,
        count: cachedList.length,
        data: cachedList,
      });
    }

    // Get from database
    const services = await ServiceModel.findAll();

    // Enrich with current status
    const enrichedServices = await Promise.all(
      services.map(async (service) => {
        try {
          const status = await HealthCheckService.getServiceStatus(service.id);
          return {
            ...service,
            current_status: status.status,
            last_check: status.last_checked || null,
          };
        } catch (error) {
          return {
            ...service,
            current_status: 'unknown',
            last_check: null,
          };
        }
      })
    );

    // Cache the result
    await cache.set(cacheKey, enrichedServices, 60); // Cache for 1 minute

    res.json({
      success: true,
      cached: false,
      count: enrichedServices.length,
      data: enrichedServices,
    });
  })
);

/**
 * POST /services
 * Add a new service to monitor
 */
router.post(
  '/',
  validateServiceCreation,
  asyncHandler(async (req, res) => {
    const serviceData = {
      name: req.body.name,
      url: req.body.url,
      check_interval: req.body.check_interval || 300,
      expected_status: req.body.expected_status || 200,
      timeout: req.body.timeout || 5000,
    };

    const serviceId = await ServiceModel.create(serviceData);

    // Invalidate cache
    await cache.del('service_list');
    await cache.del('service_metrics');

    // Get the created service
    const service = await ServiceModel.findById(serviceId);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  })
);

/**
 * GET /services/:id
 * Get specific service details
 */
router.get(
  '/:id',
  validateServiceId,
  asyncHandler(async (req, res) => {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Get current status
    const status = await HealthCheckService.getServiceStatus(req.params.id);

    res.json({
      success: true,
      data: {
        ...service,
        current_status: status,
      },
    });
  })
);

/**
 * PUT /services/:id
 * Update an existing service
 */
router.put(
  '/:id',
  validateServiceId,
  validateServiceUpdate,
  asyncHandler(async (req, res) => {
    // Check if service exists
    const exists = await ServiceModel.exists(req.params.id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Update service
    const updated = await ServiceModel.update(req.params.id, req.body);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No changes were made',
      });
    }

    // Invalidate cache
    await HealthCheckService.invalidateServiceCache(req.params.id);

    // Get updated service
    const service = await ServiceModel.findById(req.params.id);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  })
);

/**
 * DELETE /services/:id
 * Remove a service from monitoring
 */
router.delete(
  '/:id',
  validateServiceId,
  asyncHandler(async (req, res) => {
    // Check if service exists
    const exists = await ServiceModel.exists(req.params.id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Delete service
    await ServiceModel.delete(req.params.id);

    // Invalidate cache
    await HealthCheckService.invalidateServiceCache(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  })
);

/**
 * GET /services/:id/status
 * Get current status of specific service
 */
router.get(
  '/:id/status',
  validateServiceId,
  asyncHandler(async (req, res) => {
    const status = await HealthCheckService.getServiceStatus(req.params.id);

    res.json({
      success: true,
      data: status,
    });
  })
);

/**
 * POST /services/:id/check-now
 * Force immediate health check (bypass cache)
 */
router.post(
  '/:id/check-now',
  validateServiceId,
  asyncHandler(async (req, res) => {
    const result = await HealthCheckService.checkService(req.params.id, true);

    res.json({
      success: true,
      message: 'Health check performed',
      data: result,
    });
  })
);

module.exports = router;
