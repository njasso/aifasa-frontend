// services/dashboardService.js
import api from './api';

// Récupérer les statistiques globales
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    throw error;
  }
};

// Récupérer l'activité récente
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'activité récente:', error);
    throw error;
  }
};

// Récupérer les statistiques admin
export const getAdminStats = async () => {
  try {
    const response = await api.get('/dashboard/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques admin:', error);
    throw error;
  }
};