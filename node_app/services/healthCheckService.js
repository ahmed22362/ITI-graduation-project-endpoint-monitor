/**
 * Health Check Service
 * Core business logic for checking API health status
 */

const axios = require('axios');
const { cache } = require('../config/redis');
const ServiceModel = require('../models/serviceModel');
const HealthCheckModel = require('../models/healthCheckModel');

class HealthCheckService {
  /**
   * Perform health check on a service
   * @param {number} serviceId - Service ID to check
   * @param {boolean} forceCheck - Bypass cache if true
   */
  static async checkService(serviceId, forceCheck = false) {
    // Get service details
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const cacheKey = `service_status:${serviceId}`;

    // Check cache first (unless force check)
    if (!forceCheck) {
      const cachedStatus = await cache.get(cacheKey);
      if (cachedStatus) {
        return {
          ...cachedStatus,
          cached: true,
          service_name: service.name,
          service_url: service.url,
        };
      }
    }

    // Perform actual health check
    const checkResult = await this.performHttpCheck(service);

    // Store result in database
    await HealthCheckModel.create({
      service_id: serviceId,
      status_code: checkResult.status_code,
      response_time: checkResult.response_time,
      is_healthy: checkResult.is_healthy,
      error_message: checkResult.error_message,
    });

    // Cache the result
    const cacheData = {
      service_id: serviceId,
      status: checkResult.is_healthy ? 'healthy' : 'unhealthy',
      status_code: checkResult.status_code,
      response_time: checkResult.response_time,
      error_message: checkResult.error_message,
      last_checked: new Date().toISOString(),
    };

    await cache.set(cacheKey, cacheData, service.check_interval);

    // Update metrics
    await this.updateMetrics();

    return {
      ...cacheData,
      cached: false,
      service_name: service.name,
      service_url: service.url,
    };
  }

  /**
   * Perform HTTP health check
   */
  static async performHttpCheck(service) {
    const startTime = Date.now();

    try {
      const response = await axios.get(service.url, {
        timeout: service.timeout,
        validateStatus: () => true, // Don't throw on any status
        maxRedirects: 5,
      });

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;

      // Determine if healthy based on expected status
      const isHealthy = this.isStatusHealthy(
        statusCode,
        service.expected_status
      );

      return {
        status_code: statusCode,
        response_time: responseTime,
        is_healthy: isHealthy,
        error_message: isHealthy
          ? null
          : `Unexpected status code: ${statusCode}`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status_code: null,
        response_time: responseTime,
        is_healthy: false,
        error_message: error.message || 'Request failed',
      };
    }
  }

  /**
   * Check if status code is healthy
   */
  static isStatusHealthy(statusCode, expectedStatus) {
    // If expected status is set, match it exactly or use range
    if (expectedStatus >= 200 && expectedStatus < 300) {
      return statusCode >= 200 && statusCode < 300;
    }
    return statusCode === expectedStatus;
  }

  /**
   * Check all services
   */
  static async checkAllServices() {
    const services = await ServiceModel.findAll();
    const results = [];

    for (const service of services) {
      try {
        const result = await this.checkService(service.id);
        results.push(result);
      } catch (error) {
        console.error(`Error checking service ${service.id}:`, error.message);
        results.push({
          service_id: service.id,
          service_name: service.name,
          status: 'error',
          error_message: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get service status with enriched data
   */
  static async getServiceStatus(serviceId) {
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Try to get from cache first
    const cacheKey = `service_status:${serviceId}`;
    const cachedStatus = await cache.get(cacheKey);

    if (cachedStatus) {
      return {
        ...cachedStatus,
        cached: true,
        service_name: service.name,
        service_url: service.url,
        check_interval: service.check_interval,
      };
    }

    // Get latest check from database
    const latestCheck = await HealthCheckModel.getLatest(serviceId);

    if (!latestCheck) {
      return {
        service_id: serviceId,
        service_name: service.name,
        service_url: service.url,
        status: 'unknown',
        message: 'No health checks performed yet',
        cached: false,
      };
    }

    return {
      service_id: serviceId,
      service_name: service.name,
      service_url: service.url,
      status: latestCheck.is_healthy ? 'healthy' : 'unhealthy',
      status_code: latestCheck.status_code,
      response_time: latestCheck.response_time,
      error_message: latestCheck.error_message,
      last_checked: latestCheck.checked_at,
      cached: false,
      check_interval: service.check_interval,
    };
  }

  /**
   * Update global metrics in cache
   */
  static async updateMetrics() {
    const totalChecks = await HealthCheckModel.getTotalChecks();
    const healthyChecks = await HealthCheckModel.getHealthyChecks();
    const unhealthyChecks = await HealthCheckModel.getUnhealthyChecks();
    const totalServices = await ServiceModel.count();

    const metrics = {
      total_services: totalServices,
      total_checks: totalChecks,
      healthy_checks: healthyChecks,
      unhealthy_checks: unhealthyChecks,
      success_rate:
        totalChecks > 0 ? ((healthyChecks / totalChecks) * 100).toFixed(2) : 0,
      last_updated: new Date().toISOString(),
    };

    await cache.set('service_metrics', metrics, 60); // Cache for 1 minute
    return metrics;
  }

  /**
   * Invalidate cache for a service
   */
  static async invalidateServiceCache(serviceId) {
    await cache.del(`service_status:${serviceId}`);
    await cache.del('service_list');
    await cache.del('service_metrics');
  }
}

module.exports = HealthCheckService;
