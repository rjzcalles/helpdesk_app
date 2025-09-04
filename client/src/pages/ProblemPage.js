import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const informaticaOptions = [
  'Impresora Galias',
  'Impresora Zebra',
  'Pantalla',
  'Impresora Rechazos',
  'Ordenador',
  'Otros'
];

const ProblemPage = () => {
  const [step, setStep] = useState(0); // 0: elegir tipo, 1: elegir sub-tipo
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubType, setSelectedSubType] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Recoge el área seleccionada si se pasó desde AreasPage (opcional)
  const area = location.state?.area || '';

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'Ingeniería') {
      // Navega directamente a FormPage con los datos - CORREGIDO: asegurar que problemType sea exactamente 'Ingeniería'
      navigate('/form', { 
        state: { 
          area, 
          problemType: 'Ingeniería' // Asegurar que se pasa exactamente 'Ingeniería'
        } 
      });
    } else {
      setStep(1);
    }
  };

  const handleSubTypeSelect = (subType) => {
    setSelectedSubType(subType);
    // Navega a FormPage con los datos
    navigate('/form', { 
      state: { 
        area, 
        problemType: 'Informática', 
        informaticaType: subType 
      } 
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 glass-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-futuristic-secondary text-center">
        Selecciona el tipo de problema
      </h2>
      {step === 0 && (
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => handleTypeSelect('Informática')}
            className="px-6 py-4 rounded-lg font-bold shadow bg-futuristic-primary text-white hover:bg-futuristic-secondary transition"
          >
            Informática
          </button>
          <button
            onClick={() => handleTypeSelect('Ingeniería')}
            className="px-6 py-4 rounded-lg font-bold shadow bg-futuristic-primary text-white hover:bg-futuristic-secondary transition"
          >
            Ingeniería
          </button>
        </div>
      )}
      {step === 1 && (
        <>
          <h3 className="text-lg font-semibold mb-4 mt-8 text-center text-futuristic-text-secondary">
            ¿Qué tipo de problema de informática?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {informaticaOptions.map(option => (
              <button
                key={option}
                onClick={() => handleSubTypeSelect(option)}
                className="px-4 py-3 rounded-lg font-semibold shadow bg-futuristic-background-light text-futuristic-text-primary border border-futuristic-text-secondary/50 hover:bg-futuristic-primary hover:text-white transition"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProblemPage;