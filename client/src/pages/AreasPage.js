import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const AreasPage = ({ onAreaSelect }) => {
  const [selectedArea, setSelectedArea] = useState('');
  const navigate = useNavigate();

  const handleClick = (id) => {
    setSelectedArea(id);
    if (onAreaSelect) onAreaSelect(id);
  };

 const handleConfirm = () => {
  if (selectedArea) {
    navigate('/problem', { state: { area: selectedArea } });
  }
};

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 glass-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-futuristic-secondary text-center">Selecciona tu área</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {factoryAreas.map(area => (
          <button
            key={area.id}
            onClick={() => handleClick(area.id)}
            className={`px-4 py-3 rounded-lg font-semibold shadow transition-colors
              ${selectedArea === area.id
                ? 'bg-futuristic-primary text-white border-2 border-futuristic-secondary'
                : 'bg-futuristic-background-light text-futuristic-text-primary border border-futuristic-text-secondary/50 hover:bg-futuristic-secondary/10'}
            `}
          >
            {area.name}
          </button>
        ))}
      </div>
      {selectedArea && (
        <div className="mt-8 text-center text-futuristic-text-secondary">
          <span>Área seleccionada: <strong>{selectedArea}</strong></span>
        </div>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedArea}
          className={`px-6 py-3 rounded-lg font-bold shadow transition-colors
            ${selectedArea
              ? 'bg-futuristic-primary text-white hover:bg-futuristic-secondary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          Confirmar
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-lg font-bold shadow transition-colors bg-futuristic-background-light text-futuristic-text-primary border border-futuristic-text-secondary/50 hover:bg-futuristic-secondary/10"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default AreasPage;