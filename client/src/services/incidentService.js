import axios from 'axios';

const API_URL = 'http://localhost:5000/api/incidents/';

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

const incidentService = { createIncident, getIncidents, getAllIncidents, updateIncidentStatus };
export default incidentService;