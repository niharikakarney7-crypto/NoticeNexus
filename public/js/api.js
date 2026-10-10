/**
 * NoticeNexus — Centralized API Client
 * Wraps fetch requests with error handling, JSON parsing, and unified base URL.
 */

const API = {
  baseUrl: '/api',

  /**
   * Helper for GET requests with optional query parameters.
   */
  async get(endpoint, params = {}) {
    const url = new URL(this.baseUrl + endpoint, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  },

  /**
   * Helper for POST requests.
   */
  async post(endpoint, body = {}) {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }
};
