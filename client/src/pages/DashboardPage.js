import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

import incidentService from '../services/incidentService';
import TicketVisualization from '../components/TicketVisualization';
import IncidentList from '../components/IncidentList';
import MetricsCard from '../components/MetricsCard';

const socket = io('/');

const getAuthInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return { role: null, id: null };
  try {
    const decoded = jwtDecode(token);
    return { role: decoded.role, id: decoded.id };
  } catch (error) {
    return { role: null, id: null };
  }
};

const factoryAreas = [
  { id: 'Nissan/Renault', name: 'Nissan/Renault' },
  { id: 'PS', name: 'PS' },
  { id: 'Hidroalcohol', name: 'Hidroalcohol' },
  { id: 'Oficinas', name: 'Oficinas' },
  { id: 'netbees', name: 'Área de Netbees' },
  { id: '3D', name: '3D' },
  { id: 'racores', name: 'Área de Racores' },
  { id: 'Recepción', name: 'Recepción' },
  { id: 'PD', name: 'PD' },
  { id: 'Crippas y Bancos', name: 'Crippas y Bancos' },
  { id: 'PL Backup', name: 'PL Backup' },
  { id: 'Laboratorio Calidad', name: 'Laboratorio Calidad' },
  { id: 'Borygo', name: 'Borygo' },
  { id: 'LEF', name: 'LEF' },
  { id: 'Metacrilatos', name: 'Metacrilatos' },
  { id: 'MTO', name: 'MTO' },
  { id: 'Calidad', name: 'Calidad' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', area: '' });

  // Obtener rol e id del usuario autenticado
  const { role, id } = useMemo(() => getAuthInfo(), []);

  useEffect(() => {
    if (!role) {
      navigate('/');
      return;
    }

    const fetchIncidents = async () => {
      try {
        const data = await incidentService.getAllIncidents();
        setIncidents(data);
      } catch (error) {
        if (error.response?.status === 401) handleLogout();
      }
    };

    fetchIncidents();

    socket.on('incident_created', (newIncident) => setIncidents(prev => [newIncident, ...prev]));
    socket.on('incident_updated', (updatedIncident) => setIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc)));

    return () => {
      socket.off('incident_created');
      socket.off('incident_updated');
    };
  }, [role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

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

  // Filtrar incidencias si el usuario es 'user'
  const visibleIncidents = role === 'user'
    ? incidents.filter(inc => inc.userId === id)
    : incidents;

  const metrics = {
    total: visibleIncidents.length,
    open: visibleIncidents.filter(inc => inc.status === 'abierto').length,
    inProgress: visibleIncidents.filter(inc => inc.status === 'en-progreso').length,
    closed: visibleIncidents.filter(inc => inc.status === 'cerrado').length,
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="flex justify-between items-center mb-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div>
            <h1 className="text-3xl font-bold text-futuristic-text-primary">Digital Twin Interface</h1>
            <p className="text-futuristic-text-secondary">Estado de la planta en tiempo real</p>
          </div>
          <button onClick={handleLogout} className="bg-futuristic-primary/80 text-white font-semibold px-4 py-2 rounded-lg hover:bg-futuristic-primary transition-all duration-300 hover:shadow-neon-red">
            Desconectar
          </button>
        </header>

        {/* Solo mostrar métricas si no es user */}
        {role !== 'user' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard title="Señales Totales" value={metrics.total} delay="200ms" />
            <MetricsCard title="Alertas Activas" value={metrics.open} color="red" delay="300ms" />
            <MetricsCard title="En Observación" value={metrics.inProgress} color="yellow" delay="400ms" />
            <MetricsCard title="Sistemas Estables" value={metrics.closed} color="cyan" delay="500ms" />
          </div>
        )}
        <main
          className={
            role === 'user'
              ? "dashboard-user-main"
              : "grid grid-cols-1 lg:grid-cols-3 gap-8"
          }
        >
          {role === 'user' ? (
            <>
              <div className="dashboard-user-panel">
                <CreateIncidentForm {...{ formData, onChange, onSubmit, factoryAreas }} />
              </div>
              <div className="dashboard-user-panel">
                <IncidentList incidents={visibleIncidents} title="Registro de Actividad" />
              </div>
            </>
          ) : (
            <div className="lg:col-span-1 space-y-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <CreateIncidentForm {...{ formData, onChange, onSubmit, factoryAreas }} />
              <IncidentList incidents={visibleIncidents} title="Registro de Actividad" />
            </div>
          )}

          {/* Solo mostrar el mapa si no es user */}
          {role !== 'user' && (
            <div className="lg:col-span-2 glass-card p-6 min-h-[400px] lg:min-h-0 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <h2 className="text-2xl font-bold mb-4 text-futuristic-secondary">[ Mapa de Planta ]</h2>
              <TicketVisualization incidents={visibleIncidents} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const CreateIncidentForm = ({ formData, onChange, onSubmit, factoryAreas }) => (
  <div className="glass-card p-6">
    <h2 className="text-2xl font-bold mb-4 text-futuristic-secondary">[ Nueva Alerta ]</h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Clasificación</label>
        <input type="text" name="title" value={formData.title} onChange={onChange} placeholder="Ej: Falla en sensor S-1138" required className="block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Sector Afectado</label>
        <select name="area" value={formData.area} onChange={onChange} required className="block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm">
          <option value="" disabled>Seleccionar sector...</option>
          {factoryAreas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Informe Detallado</label>
        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Detalles técnicos de la alerta..." required className="block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" rows="4"></textarea>
      </div>
      <button type="submit" className="w-full bg-futuristic-primary/90 text-white font-bold py-3 rounded-lg hover:bg-futuristic-primary transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red">
        Emitir Alerta
      </button>
    </form>
  </div>
);
export default DashboardPage;