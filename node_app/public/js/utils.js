/**
 * Utility Functions
 * Shared helper functions used across the application
 */

/**
 * Generic API call wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} API response
 */
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * Format date to readable string
 * @param {string|Date} timestamp - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Never';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Relative time for recent dates
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  // Absolute date for older dates
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format response time
 * @param {number} ms - Response time in milliseconds
 * @returns {string} Formatted response time
 */
function formatResponseTime(ms) {
  if (!ms && ms !== 0) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get status badge HTML
 * @param {string} status - Status string (healthy, unhealthy, unknown)
 * @returns {string} HTML for status badge
 */
function getStatusBadge(status) {
  const statusMap = {
    healthy: { class: 'status-healthy', text: '✓ Healthy' },
    unhealthy: { class: 'status-unhealthy', text: '✗ Unhealthy' },
    unknown: { class: 'status-unknown', text: '? Unknown' },
  };

  const statusInfo = statusMap[status] || statusMap.unknown;
  return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show loading indicator
 * @param {HTMLElement} element - Element to show loading in
 */
function showLoading(element) {
  if (!element) return;
  element.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner large"></div>
      <p>Loading...</p>
    </div>
  `;
}

/**
 * Show error message
 * @param {HTMLElement} element - Element to show error in
 * @param {string} message - Error message
 */
function showError(element, message = 'An error occurred') {
  if (!element) return;
  element.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Error</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success', 2000);
  } catch (error) {
    console.error('Copy failed:', error);
    showNotification('Failed to copy', 'error');
  }
}

/**
 * Format large numbers with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {string} Formatted percentage
 */
function calculatePercentage(part, total) {
  if (!total || total === 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get color for status
 * @param {string} status - Status string
 * @returns {string} CSS color value
 */
function getStatusColor(status) {
  const colorMap = {
    healthy: '#16a34a',
    unhealthy: '#dc2626',
    unknown: '#6b7280',
  };
  return colorMap[status] || colorMap.unknown;
}
