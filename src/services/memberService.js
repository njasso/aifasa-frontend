import api from './api';

export const getMembers = async () => {
  const response = await api.get('/members');
  return response.data;
};

export const createMember = async (data) => {
  const response = await api.post('/members', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateMember = async (id, data) => {
  const response = await api.put(`/members/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};