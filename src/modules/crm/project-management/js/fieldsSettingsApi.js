// src/modules/crm/project-management/js/fieldsSettingsApi.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${import.meta.env.VITE_API_HOST || 'localhost'}:${import.meta.env.VITE_API_PORT || '8000'}/api`;

class FieldsSettingsApi {
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

  // --- проекты ---
  async getProjectFields() {
    return this.client.get('/crm/settings/fields/projects/');
  }
  async replaceProjectFields(fields) {
    return this.client.post('/crm/settings/fields/projects/replace/', { fields });
  }

  // --- задачи ---
  async getTaskFields() {
    return this.client.get('/crm/settings/fields/tasks/');
  }
  async replaceTaskFields(fields) {
    return this.client.post('/crm/settings/fields/tasks/replace/', { fields });
  }
}

export default new FieldsSettingsApi();
