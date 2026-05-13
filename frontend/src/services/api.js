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

// Reading Revelation API
export const createRevelation = async (revelationData) => {
  try {
    const response = await axios.post(`${API}/revelations`, revelationData);
    return response.data;
  } catch (error) {
    console.error('Error creating revelation:', error);
    throw error;
  }
};

export const getRevelations = async (limit = 50, publishedOnly = true) => {
  try {
    const response = await axios.get(`${API}/revelations?limit=${limit}&published_only=${publishedOnly}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revelations:', error);
    throw error;
  }
};

export const getRevelation = async (revelationId) => {
  try {
    const response = await axios.get(`${API}/revelations/${revelationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revelation:', error);
    throw error;
  }
};

// Revelation Comments API
export const submitRevelationComment = async (commentData) => {
  try {
    const response = await axios.post(`${API}/revelation-comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting revelation comment:', error);
    throw error;
  }
};

export const getRevelationComments = async (revelationId, limit = 100) => {
  try {
    const response = await axios.get(`${API}/revelation-comments/${revelationId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revelation comments:', error);
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

// Stripe Payment API
export const createPaymentCheckout = async (paymentData) => {
  try {
    const response = await axios.post(`${API}/payments/checkout`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment checkout:', error);
    throw error;
  }
};

export const getPaymentStatus = async (sessionId) => {
  try {
    const response = await axios.get(`${API}/payments/checkout/status/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};


// Lessons/Encounters Management API
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

export const createLesson = async (lessonData, token) => {
  try {
    const response = await axios.post(`${API}/lessons`, lessonData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const updateLesson = async (lessonId, lessonData, token) => {
  try {
    const response = await axios.put(`${API}/lessons/${lessonId}`, lessonData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId, token) => {
  try {
    const response = await axios.delete(`${API}/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};


// Admin Authentication API
export const adminLogin = async (credentials) => {
  try {
    const response = await axios.post(`${API}/admin/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error during admin login:', error);
    throw error;
  }
};

// News API
export const getNews = async (limit = 50, publishedOnly = true) => {
  try {
    const response = await axios.get(`${API}/news?limit=${limit}&published_only=${publishedOnly}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getNewsPost = async (newsId) => {
  try {
    const response = await axios.get(`${API}/news/${newsId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news post:', error);
    throw error;
  }
};

export const createNews = async (newsData, token) => {
  try {
    const response = await axios.post(`${API}/news`, newsData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

export const updateNews = async (newsId, newsData, token) => {
  try {
    const response = await axios.put(`${API}/news/${newsId}`, newsData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

export const deleteNews = async (newsId, token) => {
  try {
    const response = await axios.delete(`${API}/news/${newsId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

export const uploadFile = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API}/admin/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Admin Dashboard API
export const getDashboardStats = async (token) => {
  try {
    const response = await axios.get(`${API}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getAdminDonations = async (token, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.donation_type) params.append('donation_type', filters.donation_type);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.min_amount) params.append('min_amount', filters.min_amount);
    if (filters.max_amount) params.append('max_amount', filters.max_amount);
    
    const response = await axios.get(`${API}/admin/donations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin donations:', error);
    throw error;
  }
};

export const exportDonationsCSV = async (token) => {
  try {
    const response = await axios.get(`${API}/admin/donations/export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting donations:', error);
    throw error;
  }
};

export const getAdminVolunteers = async (token) => {
  try {
    const response = await axios.get(`${API}/admin/volunteers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw error;
  }
};

export const getAdminContacts = async (token) => {
  try {
    const response = await axios.get(`${API}/admin/contacts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const getAdminPrayerRequests = async (token) => {
  try {
    const response = await axios.get(`${API}/admin/prayer-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    throw error;
  }
};
