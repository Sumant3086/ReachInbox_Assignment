import axios from 'axios';

const api = axios.create({
  baseURL: 'https://reachinboxbackend.onrender.com',
  withCredentials: true
});

export const getUser = () => api.get('/auth/user');
export const logout = () => api.post('/auth/logout');
export const scheduleEmails = (formData: FormData) => api.post('/api/emails/schedule', formData);
export const getScheduledEmails = () => api.get('/api/emails/scheduled');
export const getSentEmails = () => api.get('/api/emails/sent');

export default api;
