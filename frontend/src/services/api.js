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

// Encounter Lessons API
export const createLesson = async (lessonData) => {
  try {
    const response = await axios.post(`${API}/lessons`, lessonData);
    return response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const getLessons = async (limit = 50, publishedOnly = true) => {
  try {
    const response = await axios.get(`${API}/lessons?limit=${limit}&published_only=${publishedOnly}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const getLesson = async (lessonId) => {
  try {
    const response = await axios.get(`${API}/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

// Lesson Comments API
export const submitComment = async (commentData) => {
  try {
    const response = await axios.post(`${API}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw error;
  }
};

export const getComments = async (lessonId, limit = 100) => {
  try {
    const response = await axios.get(`${API}/comments/${lessonId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
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
