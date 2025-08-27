import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Svg, Center, Text } from '@react-three/drei';
import * as THREE from 'three';
import incidentService from '../services/incidentService';

// --- Componente para el marcador 3D ---
const IncidentMarker = ({ position, color, scale = 1, count, onClick, isSelected }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
      ref.current.scale.set(scale * (isSelected ? 1.4 : 1) * pulse, scale * (isSelected ? 1.4 : 1) * pulse, scale);
    }
  });

  return (
    <group ref={ref} position={position} onClick={onClick} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6, 6, 4, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <Text position={[0, 0, 2.1]} fontSize={8} color="black" anchorX="center" anchorY="middle" fontWeight="bold">
        {count}
      </Text>
    </group>
  );
};

// --- Componente para el Modal de Incidencias (Estilo Futurista) ---
const IncidentModal = ({ incident, areaLabel, onClose, onStatusChange, onDelete }) => {
  const [status, setStatus] = useState(incident.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusChange(incident.id, status);
      onClose();
    } catch (e) {
      alert('Error al actualizar el estado');
    }
    setSaving(false);
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
        </div>
        <div className="mt-6 border-t border-futuristic-border pt-4">
          <label className="font-semibold text-futuristic-text-secondary block mb-2">Actualizar Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm">
            <option value="abierto">Abierto</option>
            <option value="en-progreso">En Progreso</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button onClick={() => onDelete(incident.id)} disabled={saving} className="px-4 py-2 bg-futuristic-text-secondary/50 text-futuristic-text-primary rounded-lg hover:bg-futuristic-text-secondary/70 transition-colors">Marcar como Resuelta</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-futuristic-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors hover:shadow-neon-red">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Configuración de Áreas y Colores ---
const areaConfig = {
    'zona-fresado': { position: new THREE.Vector3(-47, 18, 10), label: 'Zona de Fresado' },
    'control-calidad': { position: new THREE.Vector3(-48, -103, 10), label: 'Control de Calidad' },
    'netbees': { position: new THREE.Vector3(-115, -107, 10), label: 'Netbees' },
    'oficinas': { position: new THREE.Vector3(-100, -80, 10), label: 'Oficinas' },
    'racores': { position: new THREE.Vector3(-115, 60, 10), label: 'Racores' },
    'linea-ensamblaje-1': { position: new THREE.Vector3(40, -20, 10), label: 'Línea Ensamblaje 1' },
    'zona-soldadura': { position: new THREE.Vector3(10, 80, 10), label: 'Zona Soldadura' },
};

const getColorByCount = (count) => {
  if (count >= 3) return '#ff4757'; // futuristic-primary
  if (count >= 1) return '#f59e0b'; // amber-500
  return '#00f5d4'; // futuristic-secondary
};

// --- Componente Principal de Visualización ---
const TicketVisualization = ({ incidents }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalIncident, setModalIncident] = useState(null);
  const [localIncidents, setLocalIncidents] = useState(incidents);

  useEffect(() => setLocalIncidents(incidents), [incidents]);

  const incidentsByArea = useMemo(() => {
    const groups = {};
    localIncidents.forEach(inc => {
      if (!inc.area || inc.status === 'cerrado') return;
      if (!groups[inc.area]) groups[inc.area] = [];
      groups[inc.area].push(inc);
    });
    return groups;
  }, [localIncidents]);

  const handleStatusChange = async (incidentId, newStatus) => {
    const updated = await incidentService.updateStatus(incidentId, newStatus);
    setLocalIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, ...updated } : inc));
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta incidencia? Esta acción es permanente.')) return;
    await incidentService.deleteIncident(incidentId);
    setLocalIncidents(prev => prev.filter(inc => inc.id !== incidentId));
    if (modalIncident?.id === incidentId) setModalIncident(null);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-[500px] lg:h-[600px] rounded-lg bg-futuristic-background border-2 border-futuristic-border/30 overflow-hidden relative">
        <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 5 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 30]} intensity={1} />
          <Center>
            <Svg src="/NOMBRES.svg" scale={1} fillMaterial={{ color: '#172a45' }} strokeMaterial={{ color: '#00f5d4' }} />
          </Center>
          {Object.entries(incidentsByArea).map(([areaKey, areaIncidents]) => {
            const config = areaConfig[areaKey];
            if (!config) return null;
            return (
              <IncidentMarker
                key={areaKey}
                position={config.position}
                color={getColorByCount(areaIncidents.length)}
                count={areaIncidents.length}
                onClick={() => setSelectedArea(areaKey)}
                isSelected={selectedArea === areaKey}
              />
            );
          })}
          <OrbitControls enableZoom={true} enableRotate={false} enablePan={false} minZoom={2} maxZoom={3} />
        </Canvas>
      </div>

      {selectedArea && (incidentsByArea[selectedArea] || []).length > 0 && (
        <div className="border-t-2 border-futuristic-primary p-4 mt-4">
          <h3 className="font-semibold text-lg mb-2 text-futuristic-secondary">[ Alertas en: {areaConfig[selectedArea]?.label} ]</h3>
          <ul className="space-y-2">
            {(incidentsByArea[selectedArea] || []).map(inc => (
              <li key={inc.id} className="text-sm flex justify-between items-center bg-futuristic-background/70 p-2 rounded-md border border-futuristic-border/50">
                <span className="text-futuristic-text-primary font-medium">{inc.title}</span>
                <button onClick={() => setModalIncident(inc)} className="text-xs text-futuristic-secondary font-semibold hover:underline">Ver detalles</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modalIncident && (
        <IncidentModal
          incident={modalIncident}
          areaLabel={areaConfig[modalIncident.area]?.label || modalIncident.area}
          onClose={() => setModalIncident(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteIncident}
        />
      )}
    </div>
  );
};

export default TicketVisualization;