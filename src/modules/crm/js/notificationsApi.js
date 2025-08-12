import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${import.meta.env.VITE_API_HOST || 'localhost'}:${import.meta.env.VITE_API_PORT || '8000'}/api`;

class NotificationsApi {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getNotifications(params = {}) {
    return await this.client.get('/crm/notifications/', { params });
  }

  async markNotificationRead(id) {
    return await this.client.post(`/crm/notifications/${id}/mark_read/`);
  }

  async markAllNotificationsRead() {
    return await this.client.post('/crm/notifications/mark_all_read/');
  }
}
