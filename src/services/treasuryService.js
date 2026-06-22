import api from './api'; // Assurez-vous que ce chemin est correct pour votre instance Axios configurée
// import { getMembers } from './memberService'; // L'importation de getMembers est gérée directement dans Treasury.jsx

export const getTreasury = async () => {
  const response = await api.get('/treasury/transactions'); // Assurez-vous que l'URL est correcte si vous avez une route /treasury/transactions
  return response.data;
};

export const createTransaction = async (transactionData) => {
  // Prépare les données à envoyer.
  // Le champ 'details' doit être stringifié si la colonne correspondante dans la DB est JSONB
  // et que le backend ne le fait pas automatiquement.
  const dataToSend = { ...transactionData };
  if (dataToSend.details && typeof dataToSend.details === 'object') {
    dataToSend.details = JSON.stringify(dataToSend.details);
  }

  const response = await api.post('/treasury/transactions', dataToSend); // Assurez-vous que l'URL est correcte
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/treasury/summary');
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/treasury/transactions/${id}`); // Route DELETE pour les transactions
  return response.data;
};

export const getMemberFinancialStatus = async (memberId) => {
  // Cette fonction est un placeholder côté frontend.
  // La logique pour récupérer le statut financier détaillé d'un membre
  // DOIT être implémentée dans votre backend (par exemple, dans src/routes/treasury.js)
  // et interagir avec votre base de données (table members et transactions).
  console.warn("La fonction getMemberFinancialStatus nécessite une implémentation complète côté backend.");
  const response = await api.get(`/treasury/member-status/${memberId}`); // Route GET pour le statut financier du membre
  return response.data;
};
