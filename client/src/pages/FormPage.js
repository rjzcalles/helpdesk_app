import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import incidentService from '../services/incidentService';


const FormPage = () => {
  const location = useLocation();
  const state = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (state.area) {
      localStorage.setItem('form_area', state.area);
      localStorage.setItem('form_problemType', state.problemType || '');
      localStorage.setItem('form_informaticaType', state.informaticaType || '');
    }
  }, [state.area, state.problemType, state.informaticaType]);

  const area = state.area || localStorage.getItem('form_area') || '';
  const problemType = state.problemType || localStorage.getItem('form_problemType') || '';
  const informaticaType = state.informaticaType || localStorage.getItem('form_informaticaType') || '';

  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState(false);
  

  // Genera la fecha actual en formato legible
  const fecha = new Date().toLocaleString();

  // Construye el título y descripción según el tipo de problema
  let tituloDescripcion = `${fecha} - `;
  if (problemType === 'Ingeniería') {
    tituloDescripcion += 'INGENIERIA';
  } else if (problemType === 'Informática') {
    tituloDescripcion += `INFORMATICA - ${informaticaType}`;
  }

  const onChange = (e) => setText(e.target.value);

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onPasteImage = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        setImage(file);
        break;
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', `${tituloDescripcion} - ${text}`);
      data.append('description', `${tituloDescripcion} - ${text}`);
      data.append('area', area);
      data.append('problemType', problemType);
      if (informaticaType) data.append('informaticaType', informaticaType);
      if (image) data.append('image', image);

      await incidentService.createIncidentWithImage(data);
      setSuccess(true);
      setText('');
      setImage(null);
    } catch (error) {
      setSuccess(false);
      console.error('Error al crear la incidencia', error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 glass-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-futuristic-secondary text-center">
        Crear incidencia
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Área</label>
          <div className="w-full px-3 py-2 rounded-md shadow-sm bg-gray-800 border border-futuristic-text-secondary/50 text-futuristic-text-primary">
            {area || <span className="text-futuristic-text-secondary">No seleccionada</span>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Tipo de problema</label>
          <div className="w-full px-3 py-2 rounded-md shadow-sm bg-gray-800 border border-futuristic-text-secondary/50 text-futuristic-text-primary">
            {problemType || <span className="text-futuristic-text-secondary">No seleccionado</span>}
          </div>
        </div>
        {problemType === 'Informática' && (
          <div>
            <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Detalle de informática</label>
            <div className="w-full px-3 py-2 rounded-md shadow-sm bg-gray-800 border border-futuristic-text-secondary/50 text-futuristic-text-primary">
              {informaticaType || <span className="text-futuristic-text-secondary">No seleccionado</span>}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-futuristic-text-secondary mb-1">Pegar imagen (manten pulsado en el recuadro inferior + pegar)</label>
          <div
            contentEditable={true}
            onPaste={onPasteImage}
            className="border border-dashed border-futuristic-text-secondary/50 rounded-md p-4 bg-futuristic-background-light"
            style={{
              minHeight: '60px',
              maxHeight: '80px',
              overflow: 'hidden',
              outline: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
            suppressContentEditableWarning={true}
          >
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-futuristic-primary/90 text-white font-bold py-3 rounded-lg hover:bg-futuristic-primary transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red"
        >
          Emitir Alerta
        </button>
        {success && (
          <div className="mt-4 text-green-600 text-center font-semibold">
            ¡Incidencia creada correctamente!
          </div>
        )}  
      </form>
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 font-bold uppercase tracking-wider text-futuristic-secondary border-2 border-futuristic-secondary rounded-lg hover:bg-futuristic-secondary hover:text-futuristic-background transition-all duration-300 transform hover:scale-105 hover:shadow-neon-cyan w-4/5 max-w-xs text-center"
        >
          Volver a Página Principal
        </button>
      </div>
    </div>
  );
};

export default FormPage;