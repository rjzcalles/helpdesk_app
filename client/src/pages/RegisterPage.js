import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const { firstName, lastName, email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      setMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Algo salió mal.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white">Crear Cuenta</h2>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="flex space-x-4">
            <input name="firstName" type="text" value={firstName} onChange={onChange} required className="w-1/2 px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre" />
            <input name="lastName" type="text" value={lastName} onChange={onChange} required className="w-1/2 px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apellido" />
          </div>
          <input name="email" type="email" value={email} onChange={onChange} required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Correo electrónico" />
          <input name="password" type="password" value={password} onChange={onChange} required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contraseña" />
          <div>
            <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Registrarse
            </button>
          </div>
        </form>
        {message && <p className={`mt-4 text-center text-sm ${message.includes('exitoso') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}

        {/* ENLACE A LOGIN */}
        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;