/**
 * Service Model
 * Handles all database operations for monitored services
 */

const { pool } = require('../config/database');

class ServiceModel {
  /**
   * Create a new service
   */
  static async create(serviceData) {
    const { name, url, check_interval, expected_status, timeout } = serviceData;

    const [result] = await pool.query(
      `INSERT INTO services (name, url, check_interval, expected_status, timeout) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, url, check_interval, expected_status, timeout]
    );

    return result.insertId;
  }

  /**
   * Get all services
   */
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT id, name, url, check_interval, expected_status, timeout, 
              created_at, updated_at 
       FROM services 
       ORDER BY created_at DESC`
    );

    return rows;
  }

  /**
   * Get service by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, url, check_interval, expected_status, timeout, 
              created_at, updated_at 
       FROM services 
       WHERE id = ?`,
      [id]
    );

    return rows[0] || null;
  }

  /**
   * Update service
   */
  static async update(id, serviceData) {
    const allowedFields = [
      'name',
      'url',
      'check_interval',
      'expected_status',
      'timeout',
    ];
    const updates = [];
    const values = [];

    // Build dynamic UPDATE query
    Object.keys(serviceData).forEach((key) => {
      if (allowedFields.includes(key) && serviceData[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(serviceData[key]);
      }
    });

    if (updates.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete service
   */
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [
      id,
    ]);

    return result.affectedRows > 0;
  }

  /**
   * Check if service exists
   */
  static async exists(id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE id = ?',
      [id]
    );

    return rows[0].count > 0;
  }

  /**
   * Get service count
   */
  static async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM services');
    return rows[0].count;
  }
}

module.exports = ServiceModel;
