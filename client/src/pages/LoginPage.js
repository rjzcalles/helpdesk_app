import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      setMessage('Acceso concedido. Inicializando interfaz...');
      // Decodifica el token para obtener el rol
      const { role } = jwtDecode(res.data.token);
      setTimeout(() => {
        if (role === 'admin_ing') {
          navigate('/dashboard');
        }
        else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Credenciales incorrectas.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-futuristic-text-primary">Helpdesk</h1>
          <p className="text-futuristic-text-secondary text-lg">Plataforma de Soporte de Incidencias</p>
        </div>
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-center text-futuristic-secondary mb-6">[ Iniciar Sesión ]</h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-futuristic-text-secondary">Identificador de Usuario</label>
              <input id="email" name="email" type="email" value={email} onChange={onChange} required className="mt-1 block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" placeholder="usuario@maflow.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-futuristic-text-secondary">Clave de Acceso</label>
              <input id="password" name="password" type="password" value={password} onChange={onChange} required className="mt-1 block w-full px-3 py-2 bg-futuristic-background-light border border-futuristic-text-secondary/50 rounded-md shadow-sm text-futuristic-text-primary placeholder:text-futuristic-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-futuristic-secondary focus:border-futuristic-secondary sm:text-sm" placeholder="••••••••" />
            </div>
            <div>
              <button type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-futuristic-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red">
                Conectar
              </button>
            </div>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${message.includes('concedido') ? 'text-futuristic-secondary' : 'text-futuristic-primary'}`}>{message}</p>}
          <p className="mt-6 text-center text-sm text-futuristic-text-secondary">
            ¿No tienes credenciales? {' '}
            <Link to="/register" className="font-medium text-futuristic-secondary hover:underline">
              Solicita acceso aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;