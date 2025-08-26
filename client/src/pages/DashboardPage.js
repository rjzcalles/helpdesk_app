import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import incidentService from '../services/incidentService';
import FactoryPlanVisualization from '../components/TicketVisualization';

const socket = io();

const getRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      return jwtDecode(token).role;
    } catch (error) {
      return null;
    }
  }
  return null;
};

const factoryAreas = [
  { id: 'zona-fresado', name: 'Zona de Fresado' },
  { id: 'linea-ensamblaje-1', name: 'Línea de Ensamblaje 1' },
  { id: 'zona-soldadura', name: 'Zona de Soldadura' },
  { id: 'control-calidad', name: 'Control de Calidad' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userRole] = useState(getRoleFromToken());
  const [incidents, setIncidents] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', area: '' });

  useEffect(() => {
    if (!userRole) {
      handleLogout();
      return;
    }

    socket.on('connect', () => console.log('Conectado al servidor de sockets!'));

    socket.on('incident_created', (newIncident) => {
        setIncidents(prevIncidents => {
            const incidentExists = prevIncidents.some(inc => inc.id === newIncident.id);
            return incidentExists ? prevIncidents : [newIncident, ...prevIncidents];
        });
    });

    socket.on('incident_updated', (updatedIncident) => {
      setIncidents(prevIncidents =>
        prevIncidents.map(inc => inc.id === updatedIncident.id ? { ...inc, status: updatedIncident.status } : inc)
      );
    });

    const fetchIncidents = async () => {
      try {
        const data = userRole === 'admin'
          ? await incidentService.getAllIncidents()
          : await incidentService.getIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Error al cargar incidencias', error);
      }
    };

    fetchIncidents();

    return () => {
      socket.off('connect');
      socket.off('incident_created');
      socket.off('incident_updated');
    };
  }, [userRole]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await incidentService.createIncident(formData);
      setFormData({ title: '', description: '', area: '' });
    } catch (error) {
      console.error('Error al crear la incidencia', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white">
            HelpDesk <span className="text-blue-400">Maflow</span>
          </h1>
          <button onClick={handleLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Reportar Nueva Incidencia</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <input type="text" name="title" value={formData.title} onChange={onChange} placeholder="Título de la incidencia" required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                
                <select name="area" value={formData.area} onChange={onChange} required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>Selecciona un área</option>
                  {factoryAreas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>

                <textarea name="description" value={formData.description} onChange={onChange} placeholder="Describe el problema..." required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" rows="4"></textarea>
                
                <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                  Enviar Incidencia
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <FactoryPlanVisualization incidents={incidents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;