// services/memberService.js
import api from './api';

export const getMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw error;
  }
};

export const createMember = async (data) => {
  try {
    const formData = new FormData();
    
    // Ajouter tous les champs texte
    const fields = ['first_name', 'last_name', 'phone_number', 'role', 'sex', 
                    'location', 'address', 'contact', 'profession', 
                    'employment_structure', 'company_or_project', 'activities'];
    
    fields.forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    
    // ✅ AJOUTER LES FICHIERS
    if (data.photoFile && data.photoFile instanceof File) {
      console.log('📸 Ajout photo:', data.photoFile.name);
      formData.append('profilePicture', data.photoFile);
    }
    if (data.cvFile && data.cvFile instanceof File) {
      console.log('📄 Ajout CV:', data.cvFile.name);
      formData.append('cvFile', data.cvFile);
    }

    // ✅ LOG du FormData
    console.log('📤 createMember - FormData:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const response = await api.post('/members', formData);
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
    throw error;
  }
};

export const updateMember = async (id, data) => {
  try {
    const formData = new FormData();
    
    // Ajouter tous les champs texte
    const fields = ['first_name', 'last_name', 'phone_number', 'role', 'sex', 
                    'location', 'address', 'contact', 'profession', 
                    'employment_structure', 'company_or_project', 'activities'];
    
    fields.forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    
    // ✅ AJOUTER LES FICHIERS
    if (data.photoFile && data.photoFile instanceof File) {
      console.log('📸 Ajout photo:', data.photoFile.name);
      formData.append('profilePicture', data.photoFile);
    }
    if (data.cvFile && data.cvFile instanceof File) {
      console.log('📄 Ajout CV:', data.cvFile.name);
      formData.append('cvFile', data.cvFile);
    }

    // ✅ LOG du FormData
    console.log(`📤 updateMember ${id} - FormData:`);
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const response = await api.put(`/members/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Failed to update member:', error);
    throw error;
  }
};

export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete member:', error);
    throw error;
  }
};