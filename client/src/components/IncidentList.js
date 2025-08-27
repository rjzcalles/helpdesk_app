import React from 'react';

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
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h3 className="text-2xl font-bold text-futuristic-secondary mb-4">[ {title} ]</h3>
      <div className="overflow-y-auto flex-grow h-[calc(100vh-600px)] min-h-[300px] pr-2">
        {incidents.length > 0 ? (
          <ul className="space-y-3">
            {incidents.map((incident, index) => (
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
