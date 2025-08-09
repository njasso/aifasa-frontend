import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiEdit2, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin, FiFileText } from 'react-icons/fi';
import { useForm } from 'react-hook-form'; // Added for form validation and handling

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Custom Modal component for error/success messages (replaces alert/confirm)
const CustomModal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-sm mx-auto">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};


const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
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
      cvFile: null,
    },
  });

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setMessage("Erreur lors du chargement des membres.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Create a FormData object to handle files and other fields
      const formData = new FormData();

      // Append all text fields
      Object.keys(data).forEach(key => {
        if (key !== 'profilePicture' && key !== 'cvFile' && data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      // Append files only if they exist
      if (data.profilePicture && data.profilePicture.length > 0) {
        formData.append('profilePicture', data.profilePicture[0], data.profilePicture[0].name);
      }
      if (data.cvFile && data.cvFile.length > 0) {
        formData.append('cvFile', data.cvFile[0], data.cvFile[0].name);
      }

      if (editingMember) {
        // Update member
        await updateMember(editingMember.id, formData);
        setMessage("Membre mis à jour avec succès !");
      } else {
        // Create new member
        await createMember(formData);
        setMessage("Membre ajouté avec succès !");
      }
      reset();
      setIsFormOpen(false);
      setEditingMember(null);
      fetchMembers(); // Refresh the member list
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le membre:', error);
      setMessage("Erreur lors de l'opération sur le membre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
    // Populate the form with the member's data
    Object.keys(member).forEach(key => {
      if (key !== 'profilePicture' && key !== 'cvFile') {
        setValue(key, member[key]);
      }
    });
  };

  const handleDelete = async (memberId) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ?");
    if (isConfirmed) {
      try {
        await deleteMember(memberId);
        fetchMembers();
        setMessage("Membre supprimé avec succès !");
      } catch (error) {
        console.error('Failed to delete member:', error);
        setMessage("Erreur lors de la suppression du membre.");
      }
    }
  };
  
  const handleOpenForm = () => {
    setIsFormOpen(true);
    reset(); // Reset form when opening to add a new member
    setEditingMember(null);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    reset();
    setEditingMember(null);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profession.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const leaderMembers = filteredMembers.filter(member => member.role === 'leader');
  const regularMembers = filteredMembers.filter(member => member.role !== 'leader');

  const pieChartData = useMemo(() => {
    const roles = members.reduce((acc, member) => {
      const role = member.role || 'Inconnu';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    return {
      labels: Object.keys(roles),
      datasets: [
        {
          data: Object.values(roles),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [members]);

  const barChartData = useMemo(() => {
    const professions = members.reduce((acc, member) => {
      const profession = member.profession || 'Non spécifié';
      acc[profession] = (acc[profession] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(professions),
      datasets: [
        {
          label: 'Nombre de membres par profession',
          data: Object.values(professions),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [members]);

  // Framer Motion variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-emerald-800">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <CustomModal message={message} onClose={() => setMessage('')} />

      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-emerald-50 p-6 rounded-3xl shadow-lg mb-8">
        <h1 className="text-3xl font-extrabold text-center text-emerald-800 mb-4">
          Gestion des Membres
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleOpenForm}
            className="w-full sm:w-auto ml-0 sm:ml-4 bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-emerald-700 transition duration-300 flex items-center justify-center"
          >
            <FiPlus className="mr-2" />
            Ajouter un membre
          </button>
        </div>
      </motion.div>

      {/* Formulaire d'ajout/édition */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-6 rounded-3xl shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600">
            {editingMember ? 'Modifier un membre' : 'Ajouter un nouveau membre'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Prénom</label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Le prénom est requis.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Nom</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Le nom est requis.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Sexe</label>
                <select
                  {...register('sex', { required: 'Le sexe est requis.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
                {errors.sex && <span className="text-red-500 text-sm">{errors.sex.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Lieu</label>
                <input
                  type="text"
                  {...register('location', { required: 'Le lieu est requis.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.location && <span className="text-red-500 text-sm">{errors.location.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Adresse</label>
                <input
                  type="text"
                  {...register('address', { required: 'L\'adresse est requise.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Contact</label>
                <input
                  type="text"
                  {...register('contact', { required: 'Le contact est requis.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.contact && <span className="text-red-500 text-sm">{errors.contact.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Profession</label>
                <input
                  type="text"
                  {...register('profession', { required: 'La profession est requise.' })}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.profession && <span className="text-red-500 text-sm">{errors.profession.message}</span>}
              </div>
              <div>
                <label className="block text-gray-700">Structure d'emploi</label>
                <input
                  type="text"
                  {...register('employmentStructure')}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">Entreprise ou projet</label>
                <input
                  type="text"
                  {...register('companyOrProject')}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">Activités</label>
                <input
                  type="text"
                  {...register('activities')}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">Rôle</label>
                <input
                  type="text"
                  {...register('role')}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Photo de profil</label>
                <input
                  type="file"
                  {...register('profilePicture')}
                  accept="image/*"
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Fichier CV</label>
                <input
                  type="file"
                  {...register('cvFile')}
                  accept=".pdf,.doc,.docx"
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-2 rounded-lg text-emerald-600 border border-emerald-600 hover:bg-emerald-50 transition duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white font-bold transition duration-300 ${
                  isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? 'Envoi en cours...' : (editingMember ? 'Sauvegarder' : 'Ajouter')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Statistiques (Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <motion.div variants={fadeIn} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-emerald-800">Répartition par rôle</h2>
          <div className="h-64 flex items-center justify-center">
            {members.length > 0 ? (
              <Pie data={pieChartData} />
            ) : (
              <p className="text-gray-500">Aucune donnée de rôle disponible.</p>
            )}
          </div>
        </motion.div>
        <motion.div variants={fadeIn} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-emerald-800">Membres par profession</h2>
          <div className="h-64 flex items-center justify-center">
            {members.length > 0 ? (
              <Bar data={barChartData} />
            ) : (
              <p className="text-gray-500">Aucune donnée de profession disponible.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Leaders */}
      {leaderMembers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
            <FiUsers className="mr-2" />
            Leaders
            <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {leaderMembers.length} leader{leaderMembers.length > 1 ? 's' : ''}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leaderMembers.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeIn}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MemberCard
                  member={member}
                  onDelete={handleDelete}
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
                  onDelete={handleDelete}
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
