import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Svg, Center, Text } from '@react-three/drei';
import * as THREE from 'three';
import incidentService from '../services/incidentService';
import ModalPage from '../pages/ModalPage';

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

  // Solo guarda cuando se pulsa el botón
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

// --- Configuración de Áreas y Colores ---
const areaConfig = {
    'Nissan/Renault': { position: new THREE.Vector3(-47, 18, 10), label: 'Nissan/Renault' },
    'Oficinas': { position: new THREE.Vector3(-48, -103, 10), label: 'Oficinas' },
    'netbees': { position: new THREE.Vector3(-115, -107, 10), label: 'Netbees' },
    '3D': { position: new THREE.Vector3(40, -103, 10), label: '3D' },
    'racores': { position: new THREE.Vector3(-115, 60, 10), label: 'Racores' },
    'PS': { position: new THREE.Vector3(-26, -14, 10), label: 'PS' },
    'Hidroalcohol': { position: new THREE.Vector3(4, -103, 10), label: 'Hidroalcohol' },
    'Recepción': { position: new THREE.Vector3(56, -103, 10), label: 'Recepción' },
    'PD': { position: new THREE.Vector3(4, -20, 10), label: 'PD' },
    'Crippas y Bancos': { position: new THREE.Vector3(-20, -50, 10), label: 'Crippas y Bancos' },
    'PL Backup': { position: new THREE.Vector3(-12, -76, 10), label: 'PL Backup' },
    'Laboratorio Calidad': { position: new THREE.Vector3(24, -103, 10), label: 'Laboratorio Calidad' },
    'Borygo': { position: new THREE.Vector3(103, -80, 10), label: 'Borygo' },
    'LEF': { position: new THREE.Vector3(24, -62, 10), label: 'LEF' },
    'Metacrilatos': { position: new THREE.Vector3(-115, -40, 10), label: 'Metacrilatos' },
    'MTO': { position: new THREE.Vector3(-47, 43, 10), label: 'MTO' },
    'Calidad': { position: new THREE.Vector3(-20, 18, 10), label: 'Calidad' },
};

const getColorByCount = (count) => {
  if (count >= 3) return '#df0000'; // futuristic-primary
  if (count === 2) return '#ff5900'; // orange-600
  if (count === 1) return '#f59e0b'; // amber-500
  return '#00f5d4'; // futuristic-secondary
};

// --- Componente Principal de Visualización ---
const TicketVisualization = ({ incidents }) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalIncident, setModalIncident] = useState(null);
  const [localIncidents, setLocalIncidents] = useState(incidents || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => setLocalIncidents(incidents || []), [incidents]);

  const incidentsByArea = useMemo(() => {
  const groups = {};
  (localIncidents || []).forEach(inc => {
    if (!inc.area || inc.status === 'cerrado') return;
    if (!groups[inc.area]) groups[inc.area] = [];
    groups[inc.area].push(inc);
  });
  return groups;
}, [localIncidents]);

  // Nuevo: Actualiza la incidencia localmente tras guardar
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

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta incidencia? Esta acción es permanente.')) return;
    await incidentService.deleteIncident(incidentId);
    setLocalIncidents(prev => prev.filter(inc => inc.id !== incidentId));
    if (modalIncident?.id === incidentId) setModalIncident(null);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-[500px] lg:h-[600px] rounded-lg bg-futuristic-background border-2 bordera-futuristic-border/30 overflow-hidden relative">
        <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 2 }}>
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
          <OrbitControls enableZoom={true} enableRotate={false} enablePan={true} minZoom={2} maxZoom={3} />
        </Canvas>
      </div>

      {selectedArea && (incidentsByArea[selectedArea] || []).length > 0 && (
        <div className="border-t-2 border-futuristic-primary p-4 mt-4">
          <h3 className="font-semibold text-lg mb-2 text-futuristic-secondary">[ Alertas en: {areaConfig[selectedArea]?.label} ]</h3>
          <ul className="space-y-2">
            {(incidentsByArea[selectedArea] || []).map(inc => (
              <li key={inc.id} className="text-sm flex justify-between items-center bg-futuristic-background/70 p-2 rounded-md border border-futuristic-border/50">
                <span className="text-futuristic-text-primary font-medium">{inc.title}</span>
                <button onClick={() => setModalIncident(inc)}  className="text-xs text-futuristic-secondary font-semibold hover:underline">Ver detalles</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MODALPAGE: Modal centrado y scrolleable */}
      {modalIncident && (
        <ModalPage
          incident={modalIncident}
          onClose={() => setModalIncident(null)}
          onSaved={updated => {
            setLocalIncidents(prev =>
              prev.map(inc =>
                inc.id === updated.id ? updated : inc
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default TicketVisualization;