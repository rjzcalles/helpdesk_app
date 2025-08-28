import React, { useState } from 'react';

const statusStyles = {
  abierto: { text: 'text-futuristic-primary', dot: 'bg-futuristic-primary' },
  'en-progreso': { text: 'text-yellow-400', dot: 'bg-yellow-400' },
  cerrado: { text: 'text-futuristic-secondary', dot: 'bg-futuristic-secondary' },
  default: { text: 'text-futuristic-text-secondary', dot: 'bg-futuristic-text-secondary' },
};

const StatusBadge = ({ status }) => {
  const styles = statusStyles[status] || statusStyles.default;
  return (
    <div className={`inline-flex items-center text-xs font-medium ${styles.text}`}>
      <span className={`w-2 h-2 mr-2 rounded-full ${styles.dot} shadow-lg`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </div>
  );
};

const IncidentList = ({ incidents, title }) => {
  const [filter, setFilter] = useState('todos');

  const filteredIncidents = filter === 'todos'
    ? incidents
    : incidents.filter(incident => incident.status === filter);

  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-futuristic-secondary">[ {title} ]</h3>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-2 py-1 rounded-md border border-futuristic-border bg-futuristic-background-light text-futuristic-text-primary text-sm"
        >
          <option value="todos">Todos</option>
          <option value="abierto">Abierto</option>
          <option value="en-progreso">En Progreso</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>
      <div className="overflow-y-auto flex-grow h-[calc(100vh-600px)] min-h-[300px] pr-2">
        {filteredIncidents.length > 0 ? (
          <ul className="space-y-3">
            {filteredIncidents.map((incident, index) => (
              <li key={incident.id} 
                  className="bg-futuristic-background/50 p-4 rounded-lg border border-futuristic-border/50 hover:border-futuristic-secondary transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex justify-between items-start">
                  <p className="font-bold text-futuristic-text-primary truncate w-3/4">{incident.title}</p>
                  <StatusBadge status={incident.status} />
                </div>
                <p className="text-sm text-futuristic-text-secondary mt-1 line-clamp-2">{incident.description}</p>
                <div className="text-xs text-futuristic-text-secondary/70 mt-3 flex justify-between items-center">
                  <span className="font-semibold uppercase tracking-wider">{incident.area.replace('-', ' ')}</span>
                  <span>{new Date(incident.createdAt).toLocaleString()}</span>
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
  );
};

export default IncidentList;