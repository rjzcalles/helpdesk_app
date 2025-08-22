// client/src/components/IncidentList.js
import React from 'react';

const IncidentList = ({ incidents, title }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="overflow-y-auto pr-2 flex-grow">
        {incidents.length > 0 ? (
          incidents.map(incident => (
            <div key={incident.id} className="mb-3 p-3 bg-gray-900 rounded-md border border-gray-700">
              <p className="font-bold text-white truncate">{incident.title}</p>
              <p className="text-xs text-gray-400">
                Área: <span className="font-semibold">{incident.area}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No hay incidencias.</p>
        )}
      </div>
    </div>
  );
};

export default IncidentList;