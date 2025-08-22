import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Svg, Center, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- Componente para el marcador 3D ---
const IncidentMarker = ({ position, color, scale = 1, count }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.2;
      ref.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        {/* CAMBIO: Hacemos el marcador más grande */}
        <cylinderGeometry args={[5.5, 5.5, 5, 60]} /> 
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Añadimos de nuevo el texto para mostrar el contador */}
      <Text
        position={[0, 0.5, 5]} // Subimos un poco el texto para que quede sobre el cilindro más alto
        fontSize={8}
        color="black"
        anchorX="center"
      >
        {count}
      </Text>
    </group>
  );
};

// --- Componente Principal ---
const FactoryPlanVisualization = ({ incidents }) => {
  
  console.log('DATOS CRUDOS:', incidents); // Espía 1

 const incidentsByArea = useMemo(() => {
    const groups = {};
    
    // Este console.log nos mostrará la estructura del primer objeto
    if (incidents.length > 0) {
      console.log('ESTRUCTURA DE UNA INCIDENCIA:', incidents[0]);
    }

    incidents.forEach(inc => {
      // Comprobamos si el área existe y es una cadena de texto válida
      if (!inc.area || typeof inc.area !== 'string') {
        return; // Saltamos esta incidencia si no tiene un área válida
      }

      const areaKey = inc.area.trim(); // Limpiamos espacios en blanco

      if (!groups[areaKey]) {
        groups[areaKey] = [];
      }
      groups[areaKey].push(inc);
    });
    
    console.log('DATOS AGRUPADOS POR ÁREA:', groups);

    return groups;
  }, [incidents]);

  return (
    <div className="w-full h-full rounded-lg border border-gray-700 bg-black overflow-hidden">
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
        
        {/* --- LÓGICA DE RENDERIZADO DINÁMICO --- */}
        {/* Comprobamos si existe la clave 'zona-fresado' en nuestros grupos y si tiene al menos una incidencia */}
        {incidentsByArea['zona-fresado'] && incidentsByArea['zona-fresado'].length > 0 && (
          <IncidentMarker
            key="zona-fresado" // Una clave única para este marcador
            position={new THREE.Vector3(-47, 18, 10)} // La posición que especificaste
            color="#ff8000" // Mantenemos el color rojo por ahora
            scale={1}
            // Pasamos el número de incidencias en esta área para mostrarlo
            count={incidentsByArea['zona-fresado'].length} 
          />
        )}

        {incidentsByArea['control-calidad'] && incidentsByArea['control-calidad'].length > 0 && (
          <IncidentMarker
            key="control-calidad" // Una clave única para este marcador
            position={new THREE.Vector3(-48, -103, 10)} // La posición que especificaste
            color="yellow" // Mantenemos el color rojo por ahora
            scale={1}
            // Pasamos el número de incidencias en esta área para mostrarlo
            count={incidentsByArea['control-calidad'].length} 
          />
        )}

        <OrbitControls
          enableZoom={true}
          enableRotate={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};

export default FactoryPlanVisualization;