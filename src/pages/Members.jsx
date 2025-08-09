import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiEdit2, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin, FiFileText, FiXCircle } from 'react-icons/fi';

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Composant Modal pour remplacer les alertes natives
const Modal = ({ message, onConfirm, onCancel, showConfirm = true, showCancel = true, isError = false }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
        {isError && (
          <FiXCircle className="mx-auto text-red-500 text-4xl mb-4" />
        )}
        <p className="text-lg text-gray-800 mb-4">{message}</p>
        <div className="flex justify-center space-x-4">
          {showConfirm && (
            <button
              onClick={onConfirm}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition"
            >
              Confirmer
            </button>
          )}
          {showCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sex: '',
    location: '',
    address: '',
    contact: '',
    profession: '',
    employmentStructure: '',
    companyOrProject: '',
    activities: '',
    role: '',
    profilePicture: null,
    profilePictureFileName: '',
    cvFile: null,
    cvFileName: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalIsError, setModalIsError] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [deleteMemberId, setDeleteMemberId] = useState(null);

  // Nouvel état pour stocker les URLs existantes des fichiers
  const [existingFiles, setExistingFiles] = useState({
    photo_url: null,
    public_id: null,
    cv_url: null,
    cv_public_id: null
  });

  // Fonction pour charger les membres depuis l'API
  const fetchMembers = async () => {
    try {
      const allMembers = await getMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setModalMessage("Erreur lors du chargement des membres.");
      setModalIsError(true);
      setShowModal(true);
    }
  };

  // Charge les membres au premier rendu du composant
  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      if (name === 'profilePicture') {
        setFormData(prev => ({
          ...prev,
          profilePicture: files[0],
          profilePictureFileName: files[0].name
        }));
      } else if (name === 'cvFile') {
        setFormData(prev => ({
          ...prev,
          cvFile: files[0],
          cvFileName: files[0].name
        }));
      }
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteMemberId(id);
    setModalMessage("Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.");
    setModalIsError(false);
    setShowModal(true);
    setActionToConfirm(() => () => handleDelete(id));
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalIsError(false);
    setActionToConfirm(null);
  };
  
  const handleConfirmAction = () => {
    if (actionToConfirm) {
      actionToConfirm();
    }
    handleCloseModal();
  };

  const handleOpenForm = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      sex: '',
      location: '',
      address: '',
      contact: '',
      profession: '',
      employmentStructure: '',
      companyOrProject: '',
      activities: '',
      role: '',
      profilePicture: null,
      profilePictureFileName: '',
      cvFile: null,
      cvFileName: ''
    });
    setExistingFiles({
      photo_url: null,
      public_id: null,
      cv_url: null,
      cv_public_id: null
    });
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setIsEditing(true);
    setCurrentMemberId(member.id);
    setFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      sex: member.sex || '',
      location: member.location || '',
      address: member.address || '',
      contact: member.contact || '',
      profession: member.profession || '',
      employmentStructure: member.employmentStructure || '',
      companyOrProject: member.companyOrProject || '',
      activities: member.activities || '',
      role: member.role || '',
      profilePicture: null, // Réinitialiser le fichier
      profilePictureFileName: '',
      cvFile: null, // Réinitialiser le fichier
      cvFileName: ''
    });
    // Stocker les URLs existantes
    setExistingFiles({
      photo_url: member.photo_url || null,
      public_id: member.public_id || null,
      cv_url: member.cv_url || null,
      cv_public_id: member.cv_public_id || null
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== 'profilePicture' && key !== 'cvFile') {
          data.append(key, value);
        }
      });
      // Ajouter les fichiers au FormData
      if (formData.profilePicture) {
        data.append('profilePicture', formData.profilePicture);
      }
      if (formData.cvFile) {
        data.append('cv', formData.cvFile);
      }

      // Si le mode édition, ajouter les URLs existantes si aucun nouveau fichier n'est sélectionné
      if (isEditing) {
        if (!formData.profilePicture) {
          data.append('photo_url', existingFiles.photo_url || '');
          data.append('public_id', existingFiles.public_id || '');
        }
        // Ajouter les URLs du CV existant si aucun nouveau fichier n'est sélectionné
        if (!formData.cvFile) {
          data.append('cv_url', existingFiles.cv_url || '');
          data.append('cv_public_id', existingFiles.cv_public_id || '');
        }

        await updateMember(currentMemberId, data);
        setModalMessage("Membre mis à jour avec succès !");
      } else {
        await createMember(data);
        setModalMessage("Membre créé avec succès !");
      }

      setModalIsError(false);
      setShowModal(true);
      fetchMembers(); // Recharger les membres après l'opération
      setShowForm(false);
    } catch (error) {
      console.error("Form submission error:", error);
      setModalMessage("Une erreur est survenue lors de l'enregistrement du membre.");
      setModalIsError(true);
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMember(id);
      setModalMessage("Membre supprimé avec succès !");
      setModalIsError(false);
      setShowModal(true);
      fetchMembers();
    } catch (error) {
      console.error("Failed to delete member:", error);
      setModalMessage("Erreur lors de la suppression du membre.");
      setModalIsError(true);
      setShowModal(true);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      (member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [members, searchQuery]);

  // Autres parties du composant (graphs, rendu du formulaire, etc.)
  const leadershipMembers = filteredMembers.filter(m => m.role === 'leadership');
  const regularMembers = filteredMembers.filter(m => m.role !== 'leadership');
  const isAdmin = user?.role === 'admin';
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Logique du graphique Pie pour le sexe
  const genderData = useMemo(() => {
    const genders = filteredMembers.reduce((acc, member) => {
      acc[member.sex] = (acc[member.sex] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(genders),
      datasets: [{
        data: Object.values(genders),
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        hoverBackgroundColor: ['#059669', '#2563eb', '#dc2626'],
      }],
    };
  }, [filteredMembers]);

  // Logique du graphique Bar pour la structure d'emploi
  const employmentData = useMemo(() => {
    const employment = filteredMembers.reduce((acc, member) => {
      acc[member.employmentStructure] = (acc[member.employmentStructure] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(employment),
      datasets: [{
        label: 'Structure d\'emploi',
        data: Object.values(employment),
        backgroundColor: '#10b981',
      }],
    };
  }, [filteredMembers]);

  const genderOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Répartition des membres par sexe',
        color: '#10b981'
      },
    },
  };
  const employmentOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Structure d\'emploi des membres',
        color: '#10b981'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de membres',
          color: '#10b981'
        },
      },
      x: {
        title: {
          display: true,
          text: 'Structure d\'emploi',
          color: '#10b981'
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {showModal && (
        <Modal
          message={modalMessage}
          onConfirm={handleConfirmAction}
          onCancel={handleCloseModal}
          isError={modalIsError}
        />
      )}

      {/* Titre et boutons d'action */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-emerald-800">Espace Membres</h1>
        {isAdmin && (
          <button
            onClick={handleOpenForm}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
          >
            <FiPlus className="mr-2" />
            Ajouter un membre
          </button>
        )}
      </motion.div>

      {/* Formulaire d'ajout/édition */}
      {isAdmin && showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-2xl p-8 mb-10"
        >
          <h2 className="text-3xl font-bold mb-6 text-emerald-700">{isEditing ? 'Modifier un membre' : 'Ajouter un nouveau membre'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Champs du formulaire */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Prénom</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nom</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Sexe</label>
              <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" required>
                <option value="">Sélectionnez</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Rôle</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" required>
                <option value="">Sélectionnez</option>
                <option value="member">Membre</option>
                <option value="admin">Administrateur</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Lieu</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Adresse</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Contact</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Profession</label>
              <input type="text" name="profession" value={formData.profession} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Structure d'emploi</label>
              <input type="text" name="employmentStructure" value={formData.employmentStructure} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Entreprise/Projet</label>
              <input type="text" name="companyOrProject" value={formData.companyOrProject} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Activités</label>
              <input type="text" name="activities" value={formData.activities} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            {/* Champs de fichiers */}
            <div className="col-span-1 md:col-span-2 flex items-center justify-between space-x-6">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FiUpload className="mr-2" />
                  Photo de profil
                </label>
                <input type="file" name="profilePicture" onChange={handleFileChange} className="w-full" />
                {formData.profilePictureFileName && <p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {formData.profilePictureFileName}</p>}
              </div>

              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FiFileText className="mr-2" />
                  Curriculum Vitae (CV)
                </label>
                <input type="file" name="cvFile" onChange={handleFileChange} className="w-full" />
                {formData.cvFileName && <p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {formData.cvFileName}</p>}
                {isEditing && existingFiles.cv_url && !formData.cvFile && (
                  <p className="text-sm text-gray-500 mt-1">CV existant: <a href={existingFiles.cv_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Voir le CV</a></p>
                )}
              </div>
            </div>

            {/* Boutons d'action du formulaire */}
            <div className="col-span-1 md:col-span-2 flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold shadow-md hover:bg-emerald-700 transition"
              >
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Barre de recherche et statistiques */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex items-center justify-between mb-8">
        <div className="flex items-center w-full max-w-md bg-white rounded-full shadow-inner overflow-hidden border border-gray-200">
          <FiSearch className="text-gray-400 ml-4 mr-2" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 outline-none text-gray-700"
          />
        </div>
      </motion.div>

      {/* Graphiques */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <Pie data={genderData} options={genderOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <Bar data={employmentData} options={employmentOptions} />
        </div>
      </motion.div>
      
      {/* Leadership */}
      {leadershipMembers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
            <FiUsers className="mr-2" />
            Leadership
            <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {leadershipMembers.length} membre{leadershipMembers.length > 1 ? 's' : ''}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leadershipMembers.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeIn}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MemberCard
                  member={member}
                  onDelete={() => handleOpenDeleteModal(member.id)}
                  userRole={user?.role}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Membres */}
      {regularMembers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
            <FiUser className="mr-2" />
            Membres
            <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {regularMembers.length} membre{regularMembers.length > 1 ? 's' : ''}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularMembers.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeIn}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MemberCard 
                  member={member} 
                  onDelete={() => handleOpenDeleteModal(member.id)} 
                  userRole={user?.role} 
                  onEdit={handleEdit} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
