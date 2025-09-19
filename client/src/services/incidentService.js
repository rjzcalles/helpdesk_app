import axios from 'axios';

const API_URL = '/api/incidents/';
const API_URL_ALL = '/api/incidents/all';

const getToken = () => localStorage.getItem('token');

const createIncident = async (incidentData) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const response = await axios.post(API_URL, incidentData, config);
  return response.data;
};

const deleteIncident = async (incidentId) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const response = await axios.delete(API_URL + incidentId, config);
  return response.data;
};

const getIncidents = async (role) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const url = (role === 'admin_inf' || role === 'admin_ing') ? API_URL_ALL : API_URL;
  const response = await axios.get(url, config);
  return response.data;
};

const getAllIncidents = async () => {
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  const response = await axios.get(API_URL + 'all', config);
  return response.data;
};

// NUEVO: Actualiza status y asignado juntos (igual que TicketVisualization)
const updateIncident = async (id, data) => {
  const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.put(API_URL + id, data, config);
  return response.data;
};

const updateIncidentStatus = async (id, status) => {
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  const response = await axios.put(API_URL + id, { status }, config);
  return response.data;
};

const updateStatus = async (incidentId, status, asignado) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const response = await axios.patch(API_URL + incidentId + '/status', { status, asignado }, config);
  return response.data;
};

const updateAsignado = async (incidentId, asignado) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const response = await axios.patch(API_URL + incidentId + '/asignado', { asignado }, config);
  return response.data;
};

const createIncidentWithImage = async (formData) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axios.post('/api/incidents/create-with-image', formData, config);
  return response.data;
};

const incidentService = {createIncident, getIncidents, getAllIncidents, updateIncidentStatus, updateStatus, updateAsignado, updateIncident, deleteIncident, createIncidentWithImage};

export default incidentService;