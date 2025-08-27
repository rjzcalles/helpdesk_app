import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Svg, Center, Text } from '@react-three/drei';
import * as THREE from 'three';
import incidentService from '../services/incidentService';

// --- Componente para el marcador 3D, ahora es "clickeable" ---
const IncidentMarker = ({ position, color, scale = 1, count, onClick, isSelected }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.2;
      ref.current.scale.set(
        scale * (isSelected ? 1.3 : 1) * pulse,
        scale * (isSelected ? 1.3 : 1) * pulse,
        scale * (isSelected ? 1.3 : 1) * pulse
      );
    }
  });

  return (
    <group ref={ref} position={position} onClick={onClick} style={{ cursor: 'pointer' }}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[5.5, 5.5, 5, 60]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <Text
        position={[0, 0.5, 5]}
        fontSize={8}
        color="black"
        anchorX="center"
      >
        {count}
      </Text>
    </group>
  );
};

const IncidentModal = ({ incident, areaLabel, onClose, onStatusChange }) => {
  const [status, setStatus] = useState(incident.status);
  const [saving, setSaving] = useState(false);
  const [asignado, setAsignado] = useState(!!incident.asignado);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleAsignadoChange = (e) => {
    setAsignado(e.target.value === 'true');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusChange(incident.id, status, asignado);
    } catch (e) {
      alert('Error al actualizar el estado');
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-white">Detalles de la Incidencia</h2>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Título:</span>
          <span className="ml-2 text-white">{incident.title}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Descripción:</span>
          <span className="ml-2 text-white">{incident.description}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Área:</span>
          <span className="ml-2 text-white">{areaLabel}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Estado:</span>
          <select
            value={status}
            onChange={handleStatusChange}
            className="ml-2 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
          >
            <option>Abierto</option>
            <option>En proceso</option>
            <option>Cerrado</option>
          </select>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Asignado:</span>
          <select
            value={asignado ? 'true' : 'false'}
            onChange={handleAsignadoChange}
            className="ml-2 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Creado:</span>
          <span className="ml-2 text-white">{new Date(incident.createdAt).toLocaleString()}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-300">Actualizado:</span>
          <span className="ml-2 text-white">{new Date(incident.updatedAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            disabled={saving}
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Mapeo de áreas a posiciones y colores ---
const areaConfig = {
  'zona-fresado': {
    position: new THREE.Vector3(-47, 18, 10),
    color: '#ff6f00ff',
    label: 'Zona de Fresado'
  },
  'control-calidad': {
    position: new THREE.Vector3(-48, -103, 10),
    color: 'yellow',
    label: 'Control de Calidad'
  },
  'netbees': {
    position: new THREE.Vector3(-115, -107, 10),
    color: 'yellow',
    label: 'netbees'
  },
  'oficinas': {
    position: new THREE.Vector3(-100, -80, 10),
    color: 'yellow',
    label: 'oficinas'
  },
  'racores': {
    position: new THREE.Vector3(-115, 60, 10),
    color: 'yellow',
    label: 'racores'
  },
  // Puedes añadir más áreas aquí si lo necesitas
};

// --- Función para determinar el color según la cantidad de incidencias ---
const getColorByCount = (baseColor, count) => {
  if (count === 1) return 'yellow';
  if (count === 2) return '#ff6600'; // naranja fuerte
  if (count >= 3) return 'red';
  return baseColor;
};

const FactoryPlanVisualization = ({ incidents, onStatusUpdate }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalIncident, setModalIncident] = useState(null);
  const [localIncidents, setLocalIncidents] = useState(incidents);

  // Sincroniza localIncidents si cambian los incidents del padre
  useEffect(() => {
    setLocalIncidents(incidents);
  }, [incidents]);

  const incidentsByArea = useMemo(() => {
    const groups = {};
    localIncidents.forEach(inc => {
      if (!inc.area || typeof inc.area !== 'string') return;
      const areaKey = inc.area.trim();
      if (!groups[areaKey]) groups[areaKey] = [];
      groups[areaKey].push(inc);
    });
    return groups;
  }, [localIncidents]);

  // Incidencias del área seleccionada
  const selectedIncidents = selectedArea ? incidentsByArea[selectedArea] : [];

  // Cambia el estado en backend y en el estado local
  const handleStatusChange = async (incidentId, newStatus, newAsignado) => {
    try {
      const updated = await incidentService.updateStatus(incidentId, newStatus, newAsignado);
      setLocalIncidents(prev =>
        prev.map(inc =>
          inc.id === incidentId
            ? { ...inc, status: updated.status, asignado: updated.asignado, updatedAt: updated.updatedAt }
            : inc
        )
      );
      if (onStatusUpdate) onStatusUpdate(incidentId, newStatus, newAsignado);
    } catch (e) {
      alert('Error al actualizar el estado');
    }
  };

  // Elimina la incidencia en backend y en el estado local
  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('¿Seguro que quieres marcar la incidencia como resuelta y eliminarla?')) return;
    try {
      await incidentService.deleteIncident(incidentId);
      setLocalIncidents(prev => prev.filter(inc => inc.id !== incidentId));
      if (modalIncident && modalIncident.id === incidentId) setModalIncident(null);
    } catch (e) {
      alert('Error al eliminar la incidencia');
    }
  };

  return (
    <div className="w-full h-full rounded-lg border border-gray-700 bg-black overflow-hidden flex flex-col">
      {/* Canvas 3D */}
      <div style={{ height: 400, width: '100%' }}>
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 100],
            zoom: 5,
          }}
        >
          <ambientLight intensity={1.5} />
          <Center>
            <Svg
              src="/NOMBRES.svg"
              scale={1}
              fillMaterial={{ color: '#334155' }}
              strokeMaterial={{ color: '#00bfff' }}
            />
          </Center>
          {/* Renderizar marcadores dinámicamente y hacerlos clickeables */}
          {Object.entries(incidentsByArea).map(([areaKey, areaIncidents]) => {
            const config = areaConfig[areaKey];
            if (!config) return null;
            const markerColor = getColorByCount(config.color, areaIncidents.length);
            return (
              <IncidentMarker
                key={areaKey}
                position={config.position}
                color={markerColor}
                scale={1}
                count={areaIncidents.length}
                onClick={() => setSelectedArea(areaKey)}
                isSelected={selectedArea === areaKey}
              />
            );
          })}
          <OrbitControls
            enableZoom={true}
            enableRotate={false}
            enablePan={false}
          />
        </Canvas>
      </div>
      {/* Incidencias del área seleccionada */}
      {selectedArea && (
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Incidencias en {areaConfig[selectedArea]?.label || selectedArea}
          </h3>
          <ul>
            {selectedIncidents.map(inc => (
              <li key={inc.id} className="mb-2 text-gray-200 flex items-center">
                <span className="font-bold">{inc.title}</span>
                <span className="italic ml-2">{inc.status}</span>
                <button
                  className="ml-4 px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
                  onClick={() => setModalIncident(inc)}
                >
                  Ver más
                </button>
                <button
                  className="ml-2 px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800 text-sm"
                  onClick={() => handleDeleteIncident(inc.id)}
                >
                  Incidencia resuelta
                </button>
              </li>
            ))}
          </ul>
          {selectedIncidents.length === 0 && (
            <div className="text-gray-400">No hay incidencias en esta área.</div>
          )}
        </div>
      )}
      {/* Modal de detalles */}
      {modalIncident && (
        <IncidentModal
          incident={modalIncident}
          areaLabel={areaConfig[modalIncident.area]?.label || modalIncident.area}
          onClose={() => setModalIncident(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default FactoryPlanVisualization;

// --- Servicio: deleteIncident ---
// filepath: c:\Users\Marcos\Desktop\helpdesk_app\client\src\services\incidentService.js
export const deleteIncident = async (incidentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/incidents/${incidentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Error al eliminar la incidencia');
  return response.json();
};


