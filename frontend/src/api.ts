import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const getUser = () => api.get('/auth/user');
export const logout = () => api.post('/auth/logout');
export const scheduleEmails = (formData: FormData) => api.post('/api/emails/schedule', formData);
export const getScheduledEmails = () => api.get('/api/emails/scheduled');
export const getSentEmails = () => api.get('/api/emails/sent');

export default api;
