import React, { useState, useEffect, useMemo } from 'react';
import incidentService from '../services/incidentService';
import { useNavigate } from 'react-router-dom';
import MetricsCard from '../components/MetricsCard';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';

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

// Modal reutilizado (puedes extraerlo si lo tienes en otro archivo)
const IncidentModal = ({
  incident,
  areaLabel,
  onClose,
  onSaveChanges,
  saving
}) => {
  const [status, setStatus] = useState(incident.status);
  const [asignado, setAsignado] = useState(incident.asignado || '');

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    `${window.location.protocol}//${window.location.hostname}:5001`;

  const imageUrl = incident.image_url || incident.imageUrl;

  const handleOpenImageWindow = () => {
    if (!imageUrl) return;
    let url;
    if (imageUrl.startsWith('http')) {
      url = imageUrl;
    } else if (imageUrl.startsWith('/')) {
      url = `${backendUrl}${imageUrl.replace(/\\/g, '/')}`;
    } else {
      url = `${backendUrl}/${imageUrl.replace(/\\/g, '/')}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600');
  };

  const handleSave = () => {
    onSaveChanges(incident.id, status, asignado);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-futuristic-secondary">[ Alerta Detallada ]</h2>
          <button onClick={onClose} className="text-futuristic-text-secondary hover:text-futuristic-primary text-2xl">&times;</button>
        </div>
        <div className="space-y-3 text-sm border-t border-futuristic-border pt-4">
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Título:</strong> {incident.title}</p>
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Área:</strong> {areaLabel}</p>
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Creado:</strong> {new Date(incident.createdAt).toLocaleString()}</p>
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Descripción:</strong> {incident.description}</p>
          {imageUrl && (
            <div className="mt-3">
              <strong className="text-futuristic-text-secondary w-28 inline-block">Imagen:</strong>
              <img
                src={
                  imageUrl.startsWith('http')
                    ? imageUrl
                    : imageUrl.startsWith('/')
                      ? `${backendUrl}${imageUrl.replace(/\\/g, '/')}`
                      : `${backendUrl}/${imageUrl.replace(/\\/g, '/')}`
                }
                alt="Incidencia"
                className="mt-2 rounded shadow border border-futuristic-border cursor-pointer"
                style={{
                  maxHeight: '300px',
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  background: '#fff',
                  display: 'block',
                  margin: '0 auto'
                }}
                onClick={handleOpenImageWindow}
                title="Abrir imagen en ventana aparte"
              />
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">
              Cambiar estado de la incidencia:
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 rounded-md border border-futuristic-border text-futuristic-text-primary bg-futuristic-background-light"
            >
              <option value="abierto">Abierto</option>
              <option value="en-progreso">En progreso</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">
              Asignado
            </label>
            <input
              type="text"
              value={asignado}
              onChange={e => setAsignado(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 rounded-md border border-futuristic-border text-futuristic-text-primary bg-futuristic-background-light"
              placeholder="Nombre del responsable"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-futuristic-primary text-white rounded hover:bg-futuristic-secondary transition"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const IngPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [localIncidents, setLocalIncidents] = useState([]);
  const [modalIncident, setModalIncident] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await incidentService.getIncidents();
      // Solo incidencias de ingeniería
      setIncidents(data.filter(inc => inc.problemType === 'Ingeniería'));
    };
    fetchIncidents();
  }, []);

  useEffect(() => {
    setLocalIncidents(incidents || []);
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (filter === 'todos') return localIncidents;
    return localIncidents.filter(incident => incident.status === filter);
  }, [localIncidents, filter]);

  // Métricas
  const metrics = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(inc => inc.status === 'abierto').length,
    inProgress: incidents.filter(inc => inc.status === 'en-progreso').length,
    closed: incidents.filter(inc => inc.status === 'cerrado').length,
  }), [incidents]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSaveChanges = async (incidentId, newStatus, newAsignado) => {
    setSaving(true);
    await incidentService.updateStatus(incidentId, newStatus);
    await incidentService.updateAsignado(incidentId, newAsignado);
    setLocalIncidents(prev =>
      prev.map(inc =>
        inc.id === incidentId
          ? { ...inc, status: newStatus, asignado: newAsignado }
          : inc
      )
    );
    if (modalIncident && modalIncident.id === incidentId) {
      setModalIncident({ ...modalIncident, status: newStatus, asignado: newAsignado });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-futuristic-background">
      <div className="w-full max-w-screen-2xl mx-auto">
        <header className="flex justify-between items-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div>
            <h1 className="text-3xl font-bold text-futuristic-text-primary">Help Desk Interface</h1>
            <p className="text-futuristic-text-secondary">Estado de la planta en tiempo real</p>
          </div>
          <button onClick={handleLogout} className="bg-futuristic-primary/80 text-white font-semibold px-4 py-2 rounded-lg hover:bg-futuristic-primary transition-all duration-300 hover:shadow-neon-red">
            Desconectar
          </button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard title="Señales Totales" value={metrics.total} delay="200ms" />
          <MetricsCard title="Alertas Activas" value={metrics.open} color="red" delay="300ms" />
          <MetricsCard title="En Progreso" value={metrics.inProgress} color="yellow" delay="400ms" />
          <MetricsCard title="Sistemas Estables" value={metrics.closed} color="cyan" delay="500ms" />
        </div>
        <div className="max-w-2xl w-full glass-card p-6 mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-futuristic-secondary">[ Registro de Actividad Ingeniería ]</h2>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-2 py-1 rounded-md border border-futuristic-border bg-futuristic-background-light text-futuristic-text-primary text-sm"
            >
              <option value="todos">Todos</option>
              <option value="abierto">Abierto</option>
              <option value="en-progreso">En Progreso</option>
            </select>
          </div>
          <div className="overflow-y-auto min-h-[300px] pr-2">
            {filteredIncidents.length > 0 ? (
              <ul className="space-y-3">
                {filteredIncidents.map((incident, index) => (
                  <li
                    key={incident.id}
                    className="bg-futuristic-background/50 p-4 rounded-lg border border-futuristic-border/50 hover:border-futuristic-secondary transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-futuristic-text-primary truncate w-3/4">{incident.title}</p>
                      <span className="text-xs font-medium text-futuristic-secondary">{incident.status}</span>
                    </div>
                    <p className="text-sm text-futuristic-text-secondary mt-1 line-clamp-2">{incident.description}</p>
                    <div className="text-xs text-futuristic-text-secondary/70 mt-3 flex justify-between items-center">
                      <span className="font-semibold uppercase tracking-wider">{incident.area.replace('-', ' ')}</span>
                      <span>{new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => setModalIncident(incident)}
                        className="text-xs text-futuristic-secondary font-semibold hover:underline"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-futuristic-text-secondary">// No hay actividad registrada //</p>
              </div>
            )}
          </div>
        </div>
        {modalIncident && (
          <IncidentModal
            incident={modalIncident}
            areaLabel={modalIncident.area}
            onClose={() => setModalIncident(null)}
            onSaveChanges={handleSaveChanges}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default IngPage;