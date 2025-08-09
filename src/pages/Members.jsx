import React, { useState, useEffect, useMemo } from 'react';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profession: '',
    address: '',
    phone: '',
    birth_date: '',
    gender: '',
    email: '',
    photoFile: null,
    cvFile: null
  });
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null });
  const [search, setSearch] = useState('');
  const [filterProfession, setFilterProfession] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberToDeleteName, setMemberToDeleteName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMembers();
        setMembers(Array.isArray(data) ? data : data?.members || []);
      } catch (error) {
        setModal({
          show: true,
          type: 'error',
          message: `Erreur lors du chargement des membres : ${error.response?.data?.message || error.message || 'Erreur inconnue'}`
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const professions = useMemo(() => [...new Set(members.map(m => m.profession))], [members]);

  const filteredMembers = useMemo(() =>
    members.filter(m =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) &&
      (!filterProfession || m.profession === filterProfession) &&
      (!filterGender || m.gender === filterGender)
    ),
    [members, search, filterProfession, filterGender]
  );

  const genderData = useMemo(() => ({
    labels: ['Masculin', 'Féminin', 'Autre'],
    datasets: [{
      data: [
        members.filter(m => m.gender === 'Masculin').length,
        members.filter(m => m.gender === 'Féminin').length,
        members.filter(m => m.gender === 'Autre').length
      ],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
    }]
  }), [members]);

  const professionChartData = useMemo(() => ({
    labels: professions,
    datasets: [{
      label: 'Nombre de membres',
      data: professions.map(prof => members.filter(m => m.profession === prof).length),
      backgroundColor: '#36A2EB'
    }]
  }), [members, professions]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          if (key === 'cvFile') data.append('cv', value);
          else if (key === 'photoFile') data.append('photo', value);
          else data.append(key, value);
        }
      });

      if (editingId) {
        await updateMember(editingId, data);
        setMembers(prev => prev.map(m => m._id === editingId ? { ...m, ...formData } : m));
        setModal({ show: true, type: 'success', message: 'Membre modifié avec succès' });
      } else {
        const newMember = await createMember(data);
        setMembers(prev => [...prev, newMember]);
        setModal({ show: true, type: 'success', message: 'Membre ajouté avec succès' });
      }
      setFormData({
        first_name: '',
        last_name: '',
        profession: '',
        address: '',
        phone: '',
        birth_date: '',
        gender: '',
        email: '',
        photoFile: null,
        cvFile: null
      });
      setEditingId(null);
    } catch (error) {
      setModal({
        show: true,
        type: 'error',
        message: `Échec de l'opération : ${error.response?.data?.message || error.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = member => {
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      profession: member.profession,
      address: member.address,
      phone: member.phone,
      birth_date: member.birth_date,
      gender: member.gender,
      email: member.email,
      photoFile: null,
      cvFile: null
    });
    setEditingId(member._id);
  };

  const handleOpenDeleteModal = id => {
    const member = members.find(m => m._id === id);
    setMemberToDeleteId(id);
    setMemberToDeleteName(member ? `${member.first_name} ${member.last_name}` : '');
    setModal({
      show: true,
      type: 'confirm',
      message: `Voulez-vous vraiment supprimer le membre "${member ? member.first_name + ' ' + member.last_name : ''}" ?`,
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async id => {
    setLoading(true);
    try {
      await deleteMember(id);
      setMembers(prev => prev.filter(m => m._id !== id));
      setModal({ show: true, type: 'success', message: `Le membre "${memberToDeleteName}" a été supprimé avec succès.` });
    } catch (error) {
      setModal({
        show: true,
        type: 'error',
        message: `Erreur lors de la suppression : ${error.response?.data?.message || error.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal({ show: false, type: '', message: '', onConfirm: null });
  };

  return (
    <div className="members-page">
      <h1>Gestion des Membres</h1>
      <form onSubmit={handleSubmit} className="member-form">
        <input name="first_name" placeholder="Prénom" value={formData.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Nom" value={formData.last_name} onChange={handleChange} required />
        <input name="profession" placeholder="Profession" value={formData.profession} onChange={handleChange} required />
        <input name="address" placeholder="Adresse" value={formData.address} onChange={handleChange} required />
        <input name="phone" placeholder="Téléphone" value={formData.phone} onChange={handleChange} required />
        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Genre</option>
          <option value="Masculin">Masculin</option>
          <option value="Féminin">Féminin</option>
          <option value="Autre">Autre</option>
        </select>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="file" name="photoFile" onChange={handleChange} />
        <input type="file" name="cvFile" onChange={handleChange} />
        <button type="submit" disabled={loading}>
          {editingId ? 'Modifier' : 'Ajouter'}
        </button>
      </form>

      <div className="filters">
        <input placeholder="Rechercher" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterProfession} onChange={e => setFilterProfession(e.target.value)}>
          <option value="">Toutes les professions</option>
          {professions.map(prof => <option key={prof} value={prof}>{prof}</option>)}
        </select>
        <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
          <option value="">Tous les genres</option>
          <option value="Masculin">Masculin</option>
          <option value="Féminin">Féminin</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Profession</th>
            <th>Genre</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map(member => (
            <tr key={member._id}>
              <td>{member.first_name}</td>
              <td>{member.last_name}</td>
              <td>{member.profession}</td>
              <td>{member.gender}</td>
              <td>{member.email}</td>
              <td>
                <button onClick={() => handleEdit(member)}><FaEdit /></button>
                <button onClick={() => handleOpenDeleteModal(member._id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="charts">
        <Pie data={genderData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        <Bar data={professionChartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
      </div>

      {modal.show && (
        <div className="modal">
          <p>{modal.message}</p>
          {modal.type === 'confirm' ? (
            <>
              <button onClick={modal.onConfirm}>Confirmer</button>
              <button onClick={closeModal}>Annuler</button>
            </>
          ) : (
            <button onClick={closeModal}>Fermer</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
