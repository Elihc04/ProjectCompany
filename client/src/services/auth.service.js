import api from '../api/axios';

const normEmail = (e) => (e || '').trim().toLowerCase();

export const authService = {
  // Login
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email: normEmail(email), password });
    return res.data;
  },

  registerStart: async ({ name, email, password }) => {
    const res = await api.post('/auth/register/start', { name: (name || '').trim(), email: normEmail(email), password });
    return res.data;
  },
  registerVerify: async ({ email, code }) => {
    const res = await api.post('/auth/register/verify', { email: normEmail(email), code: (code || '').trim() });
    return res.data;
  },
  registerComplete: async ({ ticket, name, password }) => {
    const res = await api.post('/auth/register/complete', { ticket, name: (name || '').trim(), password });
    return res.data;
  },
};