import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiTrash2 } from 'react-icons/fi'; // Icône pour la suppression

// Assurez-vous que les props suivantes sont passées depuis Treasury.jsx :
// - transactions: Array de transactions
// - balance: Objet des soldes des caisses
// - correlations: Objet des corrélations (peut être vide pour l'instant)
// - members: Array des objets membres (pour afficher les noms)
// - transactionTypeOptions: Objet des options de type de transaction (pour les libellés)
// - caisseOptions: Objet des options de caisse (pour les libellés)
// - onDeleteTransaction: Fonction pour gérer la suppression d'une transaction
const FinanceTable = ({ transactions, balance, correlations, members, transactionTypeOptions, caisseOptions, onDeleteTransaction }) => {
  const { user } = useAuth();

  // Assurer que les props sont des tableaux/objets valides
  const safeTransactions = transactions || [];
  const safeBalance = balance || {};
  const safeCorrelations = correlations || {};
  const safeMembers = members || [];
  const safeTransactionTypeOptions = transactionTypeOptions || {};
  const safeCaisseOptions = caisseOptions || {};

  // Fonction utilitaire pour obtenir le nom du membre par ID
  const getMemberName = (memberId) => {
    const member = safeMembers.find(m => m.id === memberId);
    return member ? `${member.first_name || ''} ${member.last_name || ''}`.trim() : `ID: ${memberId}`;
  };


  // Fonction utilitaire pour obtenir le libellé du type de transaction
  const getTransactionTypeLabel = (typeKey) => {
    return safeTransactionTypeOptions[typeKey] || typeKey;
  };

  // Fonction utilitaire pour obtenir le libellé de la caisse
  const getCaisseLabel = (caisseKey) => {
    return safeCaisseOptions[caisseKey] || caisseKey;
  };

  // Fonction pour afficher les détails de la transaction
  const renderTransactionDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return 'N/A';
    }
    // Convertir l'objet details en une chaîne lisible
    // Si 'details' est une chaîne JSON, il faut le parser d'abord
    let parsedDetails = details;
    if (typeof details === 'string') {
      try {
        parsedDetails = JSON.parse(details);
      } catch (e) {
        console.error("Erreur de parsing des détails de transaction:", e);
        return details; // Retourne la chaîne brute si le parsing échoue
      }
    }

    const detailStrings = [];
    if (parsedDetails.trancheNumber) detailStrings.push(`Tranche: ${parsedDetails.trancheNumber}`);
    if (parsedDetails.withdrawalReason) detailStrings.push(`Raison Retrait: ${parsedDetails.withdrawalReason.replace(/_/g, ' ')}`);
    if (parsedDetails.tontineShares) detailStrings.push(`Parts Tontine: ${parsedDetails.tontineShares}`);
    if (parsedDetails.disciplineReason) detailStrings.push(`Discipline: ${parsedDetails.disciplineReason.replace(/_/g, ' ')}`);
    if (parsedDetails.agAbsenceReason) detailStrings.push(`Absence AG: ${parsedDetails.agAbsenceReason.replace(/_/g, ' ')}`);
    // Ajoutez d'autres champs de détails si nécessaire

    return detailStrings.join(', ') || 'N/A';
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historique des Transactions</h2>
      
      {safeTransactions.length === 0 ? (
        <p className="text-center py-4 text-gray-600">Aucune transaction enregistrée pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-emerald-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Membre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Caisse
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Détails
                </th>
                {(user?.role === 'treasurer' || user?.role === 'admin') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getMemberName(transaction.member_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {getTransactionTypeLabel(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.amount?.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {getCaisseLabel(transaction.caisse)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {renderTransactionDetails(transaction.details)}
                  </td>
                  {(user?.role === 'treasurer' || user?.role === 'admin') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md p-1"
                        title="Supprimer la transaction"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(user?.role === 'treasurer' || user?.role === 'admin') && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Résumé des Caisses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Soldes Actuels</h3>
              {Object.keys(safeBalance).length === 0 ? (
                <p className="text-gray-500">Aucune donnée de solde disponible.</p>
              ) : (
                <ul className="space-y-1 text-gray-700">
                  <li className="flex justify-between">
                    <span>Budget de l'Association:</span>
                    <span className="font-medium">{safeBalance.associationBudget?.toLocaleString('fr-FR') || 0} FCFA</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Compte Cotisation Sociale:</span>
                    <span className="font-medium">{safeBalance.socialContributionAccount?.toLocaleString('fr-FR') || 0} FCFA</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Compte Tontine:</span>
                    <span className="font-medium">{safeBalance.tontineAccount?.toLocaleString('fr-FR') || 0} FCFA</span>
                  </li>
                </ul>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Corrélations et Observations</h3>
              {Object.keys(safeCorrelations).length === 0 ? (
                <p className="text-gray-500">Aucune donnée de corrélation disponible.</p>
              ) : (
                <ul className="space-y-1 text-gray-700">
                  {Object.entries(safeCorrelations).map(([pair, value]) => (
                    <li key={pair} className="flex justify-between">
                      <span>{pair}:</span>
                      <span className="font-medium">{value.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTable;
