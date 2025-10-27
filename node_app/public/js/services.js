/**
 * Services Management JavaScript
 * Handles CRUD operations for API services
 */

// State management
let currentEditId = null;
let deleteServiceId = null;

/**
 * Initialize services page on load
 */
document.addEventListener('DOMContentLoaded', () => {
  loadServicesTable();
});

/**
 * Load services into table
 */
async function loadServicesTable() {
  const tableBody = document.getElementById('servicesTableBody');

  try {
    showTableLoading();

    const response = await apiCall('/api/services');
    const services = response.data || [];

    if (services.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="loading-cell">
            <div class="empty-state">
              <p>No services found. Add your first service to get started.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Render table rows
    tableBody.innerHTML = services
      .map((service) => renderTableRow(service))
      .join('');
  } catch (error) {
    console.error('Load services error:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-cell" style="color: var(--danger);">
          Failed to load services. Please try again.
        </td>
      </tr>
    `;
    showNotification('Failed to load services', 'error');
  }
}

/**
 * Show loading state in table
 */
function showTableLoading() {
  const tableBody = document.getElementById('servicesTableBody');
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="loading-cell">
        <div class="loading-spinner"></div>
        Loading services...
      </td>
    </tr>
  `;
}

/**
 * Render a table row for a service
 * @param {object} service - Service data
 * @returns {string} HTML for table row
 */
function renderTableRow(service) {
  const status = service.current_status || 'unknown';
  const statusBadge = getStatusBadge(status);
  const lastCheck = formatDate(service.last_check);

  return `
    <tr>
      <td><strong>${escapeHtml(service.name)}</strong></td>
      <td>
        <a href="${escapeHtml(
          service.url
        )}" target="_blank" rel="noopener" style="color: var(--primary);">
          ${truncate(service.url, 50)}
        </a>
      </td>
      <td>${statusBadge}</td>
      <td>${service.check_interval}s</td>
      <td>${lastCheck}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="handleEditService(${
            service.id
          })">Edit</button>
          <button class="action-btn danger" onclick="handleDeleteService(${
            service.id
          })">Delete</button>
          <button class="action-btn" onclick="viewServiceDetails(${
            service.id
          })">View</button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Show add service form
 */
function showAddServiceForm() {
  currentEditId = null;
  document.getElementById('formTitle').textContent = 'Add New Service';
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('serviceFormSection').style.display = 'block';
  document.getElementById('submitBtn').innerHTML =
    '<span class="btn-icon">💾</span> Save Service';

  // Scroll to form
  document
    .getElementById('serviceFormSection')
    .scrollIntoView({ behavior: 'smooth' });
}

/**
 * Close service form
 */
function closeServiceForm() {
  document.getElementById('serviceFormSection').style.display = 'none';
  document.getElementById('serviceForm').reset();
  currentEditId = null;
}

/**
 * Handle service form submission
 * @param {Event} event - Form submit event
 */
async function handleServiceSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const serviceData = {
    name: formData.get('name'),
    url: formData.get('url'),
    check_interval: parseInt(formData.get('check_interval')) || 300,
    expected_status: parseInt(formData.get('expected_status')) || 200,
    timeout: parseInt(formData.get('timeout')) || 5000,
  };

  // Validate URL
  if (!isValidUrl(serviceData.url)) {
    showNotification('Please enter a valid HTTP/HTTPS URL', 'error');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';

  try {
    if (currentEditId) {
      // Update existing service
      await apiCall(`/api/services/${currentEditId}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData),
      });
      showNotification('Service updated successfully!', 'success');
    } else {
      // Create new service
      await apiCall('/api/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
      showNotification('Service created successfully!', 'success');
    }

    closeServiceForm();
    await loadServicesTable();
  } catch (error) {
    console.error('Save service error:', error);
    showNotification(error.message || 'Failed to save service', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/**
 * Handle edit service
 * @param {number} serviceId - Service ID to edit
 */
async function handleEditService(serviceId) {
  try {
    const response = await apiCall(`/api/services/${serviceId}`);
    const service = response.data;

    currentEditId = serviceId;
    document.getElementById('formTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = serviceId;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceUrl').value = service.url;
    document.getElementById('checkInterval').value = service.check_interval;
    document.getElementById('expectedStatus').value = service.expected_status;
    document.getElementById('timeout').value = service.timeout;
    document.getElementById('submitBtn').innerHTML =
      '<span class="btn-icon">💾</span> Update Service';

    document.getElementById('serviceFormSection').style.display = 'block';
    document
      .getElementById('serviceFormSection')
      .scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Load service error:', error);
    showNotification('Failed to load service details', 'error');
  }
}

/**
 * Handle delete service - show confirmation
 * @param {number} serviceId - Service ID to delete
 */
function handleDeleteService(serviceId) {
  deleteServiceId = serviceId;
  const modal = document.getElementById('deleteModal');
  modal.classList.add('active');
}

/**
 * Close delete confirmation modal
 */
function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('active');
  deleteServiceId = null;
}

/**
 * Confirm and execute delete
 */
async function confirmDelete() {
  if (!deleteServiceId) return;

  try {
    await apiCall(`/api/services/${deleteServiceId}`, {
      method: 'DELETE',
    });

    showNotification('Service deleted successfully!', 'success');
    closeDeleteModal();
    await loadServicesTable();
  } catch (error) {
    console.error('Delete service error:', error);
    showNotification('Failed to delete service', 'error');
  }
}

/**
 * View service details
 * @param {number} serviceId - Service ID
 */
async function viewServiceDetails(serviceId) {
  try {
    const response = await apiCall(`/api/services/${serviceId}/status`);
    const status = response.data;

    const details = `
Service: ${status.service_name}
URL: ${status.service_url}
Status: ${status.status}
Status Code: ${status.status_code || 'N/A'}
Response Time: ${formatResponseTime(status.response_time)}
Last Checked: ${formatDate(status.last_checked)}
Check Interval: ${status.check_interval}s
${status.error_message ? '\nError: ' + status.error_message : ''}
    `.trim();

    alert(details);
  } catch (error) {
    console.error('View service error:', error);
    showNotification('Failed to load service status', 'error');
  }
}

// Close modal when clicking outside
document.addEventListener('click', (event) => {
  const modal = document.getElementById('deleteModal');
  if (event.target === modal) {
    closeDeleteModal();
  }
});
