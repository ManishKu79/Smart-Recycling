// frontend/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async verifySmartBinCode(code) {
    return this.request('/smartbin/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  async redeemSmartBinCode(code) {
    return this.request('/smartbin/redeem', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  async getMySmartBinCodes() {
    return this.request('/smartbin/my-codes');
  }

  async updateProfile(profileData) {
    const data = await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async changePassword(passwordData) {
    return this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  async detectWaste(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/recycle/detect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  }

  async submitRecycling(data) {
    return this.request('/recycle/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getUserRecyclingHistory(page = 1, limit = 10) {
    return this.request(`/recycle/history?page=${page}&limit=${limit}`);
  }

  async getUserStats() {
    return this.request('/recycle/stats');
  }

  async createPickupRequest(data) {
    return this.request('/pickup/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMyPickupRequests() {
    return this.request('/pickup/my-requests');
  }

  async cancelPickupRequest(id, reason) {
    return this.request(`/pickup/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  async trackPickupRequest(id) {
    return this.request(`/pickup/track/${id}`);
  }

  async reschedulePickupRequest(id, newDate, reason) {
    return this.request(`/pickup/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ newDate, reason })
    });
  }

  async ratePickup(id, rating, feedback) {
    return this.request(`/pickup/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    });
  }

  async getMyPickupStats() {
    return this.request('/pickup/my-stats');
  }

  async getDashboardStats() {
    return this.request('/user/dashboard/stats');
  }

  async getEnvironmentalImpact() {
    return this.request('/user/dashboard/impact');
  }

  async getRewardsCatalog(category = 'all') {
    return this.request(`/rewards/catalog?category=${category}`);
  }

  async getUserPoints() {
    return this.request('/rewards/points');
  }

  async redeemReward(rewardId, quantity = 1) {
    return this.request('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId, quantity })
    });
  }

  async getUserRedemptions() {
    return this.request('/rewards/history');
  }

  // ============ COLLECTOR API ============
async getCollectorDashboard() {
  return this.request('/collector/dashboard');
}

async getCollectorPickups() {
  return this.request('/collector/pickups');
}

async getCollectorHistory() {
  return this.request('/collector/history');
}

async updatePickupStatus(id, status, notes) {
  return this.request(`/collector/pickups/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  });
}

  // ============ ADMIN PICKUP MANAGEMENT ============
  async getAdminPickups(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admin/pickups?${params}`);
  }

  async getPickupDetails(id) {
    return this.request(`/admin/pickups/${id}`);
  }

  async getPickupStats() {
    return this.request('/admin/pickups/stats');
  }

  async getCollectors() {
    return this.request('/admin/collectors');
  }

  async assignPickup(id, collectorId, estimatedArrivalTime, notes) {
    return this.request(`/admin/pickups/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ collectorId, estimatedArrivalTime, notes })
    });
  }

  async markAsPickedUp(id, notes) {
    return this.request(`/admin/pickups/${id}/pickup`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  }

  async completePickup(id, { actualWeight, notes }) {
    return this.request(`/admin/pickups/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ actualWeight, notes })
    });
  }

  async cancelPickupAdmin(id, reason) {
    return this.request(`/admin/pickups/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  async approveReschedule(id, approved, adminNotes) {
    return this.request(`/admin/pickups/${id}/reschedule/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved, adminNotes })
    });
  }

  async exportPickups(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/pickups/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response;
  }

  // ============ ADMIN COLLECTOR MANAGEMENT ============
  async getAllCollectors() {
    return this.request('/admin/collectors');
  }

  async createCollector(collectorData) {
    return this.request('/admin/collectors', {
      method: 'POST',
      body: JSON.stringify(collectorData)
    });
  }

  async updateCollector(id, collectorData) {
    return this.request(`/admin/collectors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collectorData)
    });
  }

  async deleteCollector(id) {
    return this.request(`/admin/collectors/${id}`, {
      method: 'DELETE'
    });
  }

  // ============ ADMIN GENERAL ============
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllSubmissions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admin/submissions?${params}`);
  }

  async approveSubmission(id) {
    return this.request(`/admin/submissions/${id}/approve`, {
      method: 'PUT'
    });
  }

  async rejectSubmission(id, reason) {
    return this.request(`/admin/submissions/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  async getAllUsers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admin/users?${params}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async toggleUserStatus(userId) {
    return this.request(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT'
    });
  }

  async createReward(rewardData) {
    return this.request('/admin/rewards', {
      method: 'POST',
      body: JSON.stringify(rewardData)
    });
  }

  async updateReward(id, rewardData) {
    return this.request(`/admin/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rewardData)
    });
  }

  async deleteReward(id) {
    return this.request(`/admin/rewards/${id}`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();