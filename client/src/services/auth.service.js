import api from '../api/axios';

const normEmail = (e) => (e || '').trim().toLowerCase();

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email: normEmail(email), password });
    return res.data;
  },
  register: async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name: (name || '').trim(), email: normEmail(email), password });
    return res.data;
  },
};