import axios from 'axios';

const API_URL = '/api/incidents/';

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

const getIncidents = async () => {
  const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const getAllIncidents = async () => {
  const config = {
    headers: {
      // Esta línea es crucial
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  const response = await axios.get(API_URL + 'all', config);
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

const incidentService = { createIncident, getIncidents, getAllIncidents, updateIncidentStatus, updateStatus, updateAsignado, deleteIncident};
export default incidentService;