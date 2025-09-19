import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import incidentService from '../services/incidentService';

const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    `${window.location.protocol}//${window.location.hostname}:5001`;

const ModalPage = ({ incident, onClose, onSaved }) => {
  const [modalIncident, setModalIncident] = useState(incident);
  const [saving, setSaving] = useState(false);

  // Definir imageUrl (puede venir como incident.image_url o incident.imageUrl)
  const imageUrl = modalIncident.image_url || modalIncident.imageUrl || '';

  // Función para abrir la imagen en una ventana aparte
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
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    await incidentService.updateIncident(modalIncident.id, {
      status: modalIncident.status,
      asignado: modalIncident.asignado
    });
    setSaving(false);
    if (onSaved) onSaved(modalIncident);
    if (onClose) onClose();
  };

  if (!modalIncident) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      style={{ minHeight: '100vh', left: 0, top: 0, right: 0, bottom: 0, zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="glass-card p-6 w-full max-w-lg animate-fade-in-up"
        style={{ margin: 0, zIndex: 10000, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-futuristic-secondary">[ Detalles de la Incidencia ]</h2>
          <button onClick={onClose} className="text-futuristic-text-secondary hover:text-futuristic-primary text-2xl">&times;</button>
        </div>
        <div className="space-y-3 text-sm border-t border-futuristic-border pt-4">
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Título:</strong> {modalIncident.title}</p>
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Área:</strong> {modalIncident.area}</p>
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Creado:</strong> {new Date(modalIncident.createdAt).toLocaleString()}</p>
          <p><strong className="text-futuristic-text-secondary w-28 inline-block">Descripción:</strong> {modalIncident.description}</p>
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
              value={modalIncident.status}
              onChange={e => setModalIncident({ ...modalIncident, status: e.target.value })}
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
              value={modalIncident.asignado || ''}
              onChange={e => setModalIncident({ ...modalIncident, asignado: e.target.value })}
              disabled={saving}
              className="w-full px-3 py-2 rounded-md border border-futuristic-border text-futuristic-text-primary bg-futuristic-background-light"
              placeholder="Nombre del responsable"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveChanges}
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

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ModalPage;