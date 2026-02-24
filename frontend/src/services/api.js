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

  // ============ AUTHENTICATION ============
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

  // ============ USER PROFILE ============
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

  // ============ RECYCLING ============
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

  // ============ USER DASHBOARD ============
  async getDashboardStats() {
    return this.request('/user/dashboard/stats');
  }

  async getEnvironmentalImpact() {
    return this.request('/user/dashboard/impact');
  }

  // ============ REWARDS ============
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

  // ============ ADMIN ============
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