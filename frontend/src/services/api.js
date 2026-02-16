import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

// Contact Form API
export const submitContact = async (contactData) => {
  try {
    const response = await axios.post(`${API}/contact`, contactData);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

export const getContacts = async (limit = 50) => {
  try {
    const response = await axios.get(`${API}/contact?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Volunteer API
export const submitVolunteer = async (volunteerData) => {
  try {
    const response = await axios.post(`${API}/volunteers`, volunteerData);
    return response.data;
  } catch (error) {
    console.error('Error submitting volunteer application:', error);
    throw error;
  }
};

export const getVolunteers = async (limit = 50) => {
  try {
    const response = await axios.get(`${API}/volunteers?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw error;
  }
};

// Prayer Request API
export const submitPrayerRequest = async (prayerData) => {
  try {
    const response = await axios.post(`${API}/prayer-requests`, prayerData);
    return response.data;
  } catch (error) {
    console.error('Error submitting prayer request:', error);
    throw error;
  }
};

export const getPrayerRequests = async (limit = 10, isPublic = true) => {
  try {
    const response = await axios.get(`${API}/prayer-requests?limit=${limit}&public=${isPublic}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    throw error;
  }
};

// Donation API
export const submitDonation = async (donationData) => {
  try {
    const response = await axios.post(`${API}/donations`, donationData);
    return response.data;
  } catch (error) {
    console.error('Error submitting donation:', error);
    throw error;
  }
};

export const getDonations = async (limit = 50) => {
  try {
    const response = await axios.get(`${API}/donations?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw error;
  }
};

// Stats API
export const getMinistryStats = async () => {
  try {
    const response = await axios.get(`${API}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ministry stats:', error);
    throw error;
  }
};

// Health Check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API}/`);
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};
