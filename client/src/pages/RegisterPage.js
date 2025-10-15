import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { firstName, lastName, email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register', formData);
      setMessage('Solicitud de registro enviada. Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error en la solicitud.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="text-center mb-8">
            <img
              src="/ARIS2.png"
              alt="ARIS"
              className="mx-auto mb-0 w-40 h-auto max-w-xs"
            />
          <p className="text-futuristic-text-secondary text-lg">Agente de Resolución de Incidencias y Soporte</p>
        </div>
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-center text-futuristic-secondary mb-6">[ Solicitar Acceso ]</h2>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="firstName" className="block text-sm font-medium text-futuristic-text-secondary">Nombre</label>
                <input id="firstName" name="firstName" type="text" value={firstName} onChange={onChange} required className="mt-1 block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" placeholder="Nombre" />
              </div>
              <div className="w-1/2">
                <label htmlFor="lastName" className="block text-sm font-medium text-futuristic-text-secondary">Apellido</label>
                <input id="lastName" name="lastName" type="text" value={lastName} onChange={onChange} required className="mt-1 block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" placeholder="Apellido" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-futuristic-text-secondary">Correo Corporativo</label>
              <input id="email" name="email" type="email" value={email} onChange={onChange} required className="mt-1 block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" placeholder="usuario@maflow.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-futuristic-text-secondary">Crear Clave de Acceso</label>
              <input id="password" name="password" type="password" value={password} onChange={onChange} required className="mt-1 block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" placeholder="••••••••" />
            </div>
            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-futuristic-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red">
                Enviar Solicitud
              </button>
            </div>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${message.includes('exitosa') ? 'text-futuristic-secondary' : 'text-futuristic-primary'}`}>{message}</p>}
          <p className="mt-6 text-center text-sm text-futuristic-text-secondary">
            ¿Ya tienes credenciales?{' '}
            <Link to="/login" className="font-medium text-futuristic-secondary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
