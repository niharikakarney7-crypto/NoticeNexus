/**
 * NoticeNexus — Centralized API Client
 * Wraps fetch requests with error handling, JSON parsing, unified base URL,
 * and automatic Bearer token injection for authenticated endpoints.
 */

const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('noticenexus_token');
  },

  setToken(token) {
    localStorage.setItem('noticenexus_token', token);
  },

  clearToken() {
    localStorage.removeItem('noticenexus_token');
    localStorage.removeItem('noticenexus_user');
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('noticenexus_user') || 'null');
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    localStorage.setItem('noticenexus_user', JSON.stringify(user));
  },

  getHeaders(customHeaders = {}) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = new URL(this.baseUrl + endpoint, window.location.origin);
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        if (options.params[key] !== undefined && options.params[key] !== null && options.params[key] !== '') {
          url.searchParams.append(key, options.params[key]);
        }
      });
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: this.getHeaders(options.headers)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  },

  get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  patch(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
