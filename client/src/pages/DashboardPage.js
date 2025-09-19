import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import IncidentModal from '../components/TicketVisualization';
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
  const [formData, setFormData] = useState({ title: '', description: '', area: '', problemType: '' });
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [modalIncident, setModalIncident] = useState(null);
  const [saving, setSaving] = useState(false);

  // Modal para métricas
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [metricsFilter, setMetricsFilter] = useState('todos');

  // Referencia para el campo de imagen editable
  const imageInputRef = useRef(null);

  // Obtener rol e id del usuario autenticado
  const { role } = useMemo(() => getAuthInfo(), []);

  useEffect(() => {
    if (!role) {
      navigate('/');
      return;
    }

    const fetchIncidents = async () => {
      try {
        const data = await incidentService.getIncidents(role);
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIncidents(sorted);
      } catch (error) {
        if (error.response?.status === 401) handleLogout();
      }
    };

    fetchIncidents();

    socket.on('incident_created', (newIncident) =>
      setIncidents(prev => [newIncident, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    );
    socket.on('incident_updated', (updatedIncident) =>
      setIncidents(prev =>
        prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    );

    return () => {
      socket.off('incident_created');
      socket.off('incident_updated');
    };
    // eslint-disable-next-line
  }, [role, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onPasteImage = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        setImage(file);
        break;
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('area', formData.area);
      data.append('problemType', formData.problemType);
      if (image) data.append('image', image);

      await incidentService.createIncidentWithImage(data);
      setFormData({ title: '', description: '', area: '', problemType: '' });
      setImage(null);
      // Limpiar el campo visual editable de imagen
      if (imageInputRef.current) {
        imageInputRef.current.innerHTML = '';
      }
    } catch (error) {
      console.error('Error al crear la incidencia', error);
    }
  };

  // Filtrado de incidencias según el rol
  const visibleIncidents = useMemo(() => {
    let filtered = incidents.filter(inc => inc.status !== '');
    if (role === 'admin_ing') {
      filtered = filtered.filter(inc => inc.problemType === 'Ingeniería');
    }
    return filtered;
  }, [incidents, role]);

  // Filtrado adicional para admin_ing según el filtro de estado
  const filteredIncidents = useMemo(() => {
    if (role !== 'admin_ing') return visibleIncidents;
    if (filter === 'todos') return visibleIncidents;
    return visibleIncidents.filter(inc => inc.status === filter);
  }, [visibleIncidents, filter, role]);

  const metrics = {
    total: incidents.length,
    open: incidents.filter(inc => inc.status === 'abierto').length,
    inProgress: incidents.filter(inc => inc.status === 'en-progreso').length,
    closed: incidents.filter(inc => inc.status === 'cerrado').length,
  };

  // Modal de métricas: abrir y filtrar
  const handleMetricsClick = (filter) => {
    setMetricsFilter(filter);
    setMetricsModalOpen(true);
  };

  const handleSaveChanges = async (incidentId, newStatus, newAsignado) => {
    setSaving(true);
    await incidentService.updateStatus(incidentId, newStatus);
    await incidentService.updateAsignado(incidentId, newAsignado);
    setIncidents(prev =>
      prev.map(inc =>
        inc.id === incidentId
          ? { ...inc, status: newStatus, asignado: newAsignado }
          : inc
      )
    );
    setSaving(false);
    setModalIncident(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="flex justify-between items-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div>
            <h1 className="text-3xl font-bold text-futuristic-text-primary">Help Desk Interface</h1>
            <p className="text-futuristic-text-secondary">Estado de la planta en tiempo real</p>
          </div>
          <button onClick={handleLogout} className="bg-futuristic-primary/80 text-white font-semibold px-4 py-2 rounded-lg hover:bg-futuristic-primary transition-all duration-300 hover:shadow-neon-red">
            Desconectar
          </button>
        </header>

        {(role === 'admin_inf') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard title="Señales Totales" value={metrics.total} delay="200ms" onClick={() => handleMetricsClick('todos')} />
            <MetricsCard title="Alertas Activas" value={metrics.open} color="red" delay="300ms" onClick={() => handleMetricsClick('abierto')} />
            <MetricsCard title="En Progreso" value={metrics.inProgress} color="yellow" delay="400ms" onClick={() => handleMetricsClick('en-progreso')} />
            <MetricsCard title="Sistemas Estables" value={metrics.closed} color="cyan" delay="500ms" onClick={() => handleMetricsClick('cerrado')} />
          </div>
        )}

        {/* Modal de métricas */}
        {metricsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setMetricsModalOpen(false)}>
            <div className="glass-card p-6 w-full max-w-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 text-futuristic-secondary">
                Incidencias {metricsFilter === 'todos' ? 'Totales' : metricsFilter}
              </h2>
              <IncidentList
                incidents={
                  metricsFilter === 'todos'
                    ? visibleIncidents
                    : visibleIncidents.filter(inc => inc.status === metricsFilter)
                }
                title="Incidencias"
                role={role}
              />
              <div className="mt-4 flex justify-end">
                <button onClick={() => setMetricsModalOpen(false)} className="px-4 py-2 bg-futuristic-primary text-white rounded hover:bg-futuristic-secondary transition">
                  Cerrar
                </button>
              </div>
            </div>
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
                <CreateIncidentForm
                  formData={formData}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  factoryAreas={factoryAreas}
                  image={image}
                  onPasteImage={onPasteImage}
                  imageInputRef={imageInputRef}
                />
              </div>
              <div className="dashboard-user-panel">
                <IncidentList incidents={visibleIncidents} title="Registro de Actividad" role={role} />
              </div>
            </>
          ) : role === 'admin_inf' ? (
            <>
              <div className="lg:col-span-1 space-y-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <CreateIncidentForm
                  formData={formData}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  factoryAreas={factoryAreas}
                  image={image}
                  onPasteImage={onPasteImage}
                  imageInputRef={imageInputRef}
                />
                <IncidentList
                  incidents={visibleIncidents}
                  title="Registro de Actividad" role={role}
                />
              </div>
              <div className="lg:col-span-2 glass-card p-6 min-h-[400px] lg:min-h-0 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <h2 className="text-2xl font-bold mb-4 text-futuristic-secondary">[ Mapa de Planta ]</h2>
                <TicketVisualization
                  incidents={visibleIncidents}
                />
              </div>
            </>
          ) : role === 'admin_ing' ? (
              <div className="lg:col-span-3 flex justify-center items-start">
                <div className="w-full max-w-2xl space-y-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                  <IncidentList
                    incidents={visibleIncidents.filter(inc => inc.problemType === 'Ingeniería')}
                    title="Registro de Actividad" role={role}
                  />
                </div>
              </div>
            ) : null}
        </main>
      </div>
    </div>
  );
};

const CreateIncidentForm = ({ formData, onChange, onSubmit, factoryAreas, image, onPasteImage, imageInputRef }) => (
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
        <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Tipo de problema</label>
        <select name="problemType" value={formData.problemType} onChange={onChange} required className="block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm">
          <option value="" disabled>Seleccionar tipo...</option>
          <option value="Informática">Informática</option>
          <option value="Ingeniería">Ingeniería</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Informe Detallado</label>
        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Detalles técnicos de la alerta..." required className="block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" rows="4"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Imagen (solo pegar)</label>
        <div
          ref={imageInputRef}
          contentEditable={true}
          onPaste={onPasteImage}
          className="border border-dashed border-futuristic-text-secondary/50 rounded-md p-4 bg-futuristic-background-light"
          style={{
            minHeight: '60px',
            maxHeight: '80px',
            overflow: 'hidden',
            outline: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
          suppressContentEditableWarning={true}
        >
        </div>
      </div>
      <button type="submit" className="w-full bg-futuristic-primary/90 text-white font-bold py-3 rounded-lg hover:bg-futuristic-primary transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red">
        Emitir Alerta
      </button>
    </form>
  </div>
);

export default DashboardPage;