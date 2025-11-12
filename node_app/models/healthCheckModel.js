/**
 * Health Check Model
 * Handles all database operations for health check history
 */

const { pool } = require('../config/database');

class HealthCheckModel {
  /**
   * Create a new health check record
   */
  static async create(checkData) {
    const {
      service_id,
      status_code,
      response_time,
      is_healthy,
      error_message,
    } = checkData;

    const [result] = await pool.query(
      `INSERT INTO health_checks 
       (service_id, status_code, response_time, is_healthy, error_message) 
       VALUES (?, ?, ?, ?, ?)`,
      [service_id, status_code, response_time, is_healthy, error_message]
    );

    return result.insertId;
  }

  /**
   * Get latest health check for a service
   */
  static async getLatest(serviceId) {
    const [rows] = await pool.query(
      `SELECT id, service_id, status_code, response_time, is_healthy, 
              error_message, checked_at 
       FROM health_checks 
       WHERE service_id = ? 
       ORDER BY checked_at DESC 
       LIMIT 1`,
      [serviceId]
    );

    return rows[0] || null;
  }

  /**
   * Get health check history for a service
   */
  static async getHistory(serviceId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT id, service_id, status_code, response_time, is_healthy, 
              error_message, checked_at 
       FROM health_checks 
       WHERE service_id = ? 
       ORDER BY checked_at DESC 
       LIMIT ?`,
      [serviceId, limit]
    );

    return rows;
  }

  /**
   * Get health check history for a service (alias for getHistory)
   */
  static async getHistoryByServiceId(serviceId, limit = 10) {
    return this.getHistory(serviceId, limit);
  }

  /**
   * Get latest health check for a service (alias for getLatest)
   */
  static async getLatestByServiceId(serviceId) {
    return this.getLatest(serviceId);
  }

  /**
   * Get overall metrics
   */
  static async getMetrics() {
    const [total, healthy, unhealthy] = await Promise.all([
      this.getTotalChecks(),
      this.getHealthyChecks(),
      this.getUnhealthyChecks(),
    ]);

    return {
      total_checks: total,
      healthy_checks: healthy,
      unhealthy_checks: unhealthy,
    };
  }

  /**
   * Get total checks count
   */
  static async getTotalChecks() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM health_checks'
    );
    return rows[0].count;
  }

  /**
   * Get healthy checks count
   */
  static async getHealthyChecks() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM health_checks WHERE is_healthy = true'
    );
    return rows[0].count;
  }

  /**
   * Get unhealthy checks count
   */
  static async getUnhealthyChecks() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM health_checks WHERE is_healthy = false'
    );
    return rows[0].count;
  }

  /**
   * Get average response time for a service
   */
  static async getAverageResponseTime(serviceId) {
    const [rows] = await pool.query(
      `SELECT AVG(response_time) as avg_response_time 
       FROM health_checks 
       WHERE service_id = ? AND is_healthy = true`,
      [serviceId]
    );
    return rows[0].avg_response_time || 0;
  }

  /**
   * Delete old health check records (cleanup)
   */
  static async deleteOlderThan(days = 30) {
    const [result] = await pool.query(
      `DELETE FROM health_checks 
       WHERE checked_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    return result.affectedRows;
  }
}

module.exports = HealthCheckModel;
