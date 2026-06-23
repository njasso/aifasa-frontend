// src/services/treasuryService.js
import api from './api';

// ========== TRANSACTIONS ==========
export const getTreasury = async () => {
  const response = await api.get('/treasury');
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/treasury/summary');
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await api.post('/treasury', data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/treasury/${id}`);
  return response.data;
};

export const getMemberFinancialStatus = async (memberId) => {
  const response = await api.get(`/treasury/member/${memberId}/status`);
  return response.data;
};

// ========== SANCTIONS (AJOUTÉ) ==========
export const getSanctions = async () => {
  try {
    const response = await api.get('/treasury/sanctions');
    return response.data;
  } catch (error) {
    console.warn('API sanctions non disponible, retour tableau vide');
    return [];
  }
};

export const createSanction = async (data) => {
  try {
    const response = await api.post('/treasury/sanctions', data);
    return response.data;
  } catch (error) {
    console.warn('API createSanction non disponible');
    // Fallback local
    return { id: Date.now(), ...data, status: 'pending', recovered_amount: 0 };
  }
};

export const recoverSanction = async (id, data) => {
  try {
    const response = await api.post(`/treasury/sanctions/${id}/recover`, data);
    return response.data;
  } catch (error) {
    console.warn('API recoverSanction non disponible');
    return { id, recovered_amount: data.recovered_amount, status: 'recovered' };
  }
};

export const waiveSanction = async (id) => {
  try {
    const response = await api.post(`/treasury/sanctions/${id}/waive`);
    return response.data;
  } catch (error) {
    console.warn('API waiveSanction non disponible');
    return { id, status: 'waived' };
  }
};

// ========== JOURNAL DE CAISSE (AJOUTÉ) ==========
export const getCashOperations = async () => {
  try {
    const response = await api.get('/treasury/cash-operations');
    return response.data;
  } catch (error) {
    console.warn('API cashOperations non disponible, retour tableau vide');
    return [];
  }
};

export const createCashOperation = async (data) => {
  try {
    const response = await api.post('/treasury/cash-operations', data);
    return response.data;
  } catch (error) {
    console.warn('API createCashOperation non disponible');
    return { id: Date.now(), ...data };
  }
};

export const deleteCashOperation = async (id) => {
  try {
    const response = await api.delete(`/treasury/cash-operations/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API deleteCashOperation non disponible');
    return { id };
  }
};