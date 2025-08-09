import api from './api';

/**
 * Fetches a list of all members from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of member objects.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw error;
  }
};

/**
 * Creates a new member with the provided data.
 * NOTE: The 'multipart/form-data' header is used for file uploads, such as a profile picture.
 * @param {object} data The member data to be created. This can be a FormData object.
 * @returns {Promise<object>} A promise that resolves to the newly created member object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const createMember = async (data) => {
  try {
    const response = await api.post('/members', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
    throw error;
  }
};

/**
 * Updates an existing member with new data.
 * NOTE: The 'multipart/form-data' header is used for file uploads, such as a profile picture.
 * @param {string|number} id The unique identifier of the member to update.
 * @param {object} data The updated member data. This can be a FormData object.
 * @returns {Promise<object>} A promise that resolves to the updated member object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const updateMember = async (id, data) => {
  try {
    const response = await api.put(`/members/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update member:', error);
    throw error;
  }
};

/**
 * Deletes a member by their unique identifier.
 * @param {string|number} id The unique identifier of the member to delete.
 * @returns {Promise<object>} A promise that resolves to the response data from the deletion.
 * @throws {Error} Throws an error if the API call fails.
 */
export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete member:', error);
    throw error;
  }
};
