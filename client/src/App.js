import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProblemPage from './pages/ProblemPage';
import AreasPage from './pages/AreasPage';
import FormPage from './pages/FormPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';
import axios from 'axios';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />

        {/* Rutas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/areas" element={<AreasPage />} />
          <Route path="/problem" element={<ProblemPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

const HomePage = () => {
  const navigate = useNavigate();

  const handleOperariosLogin = async () => {
    try {
      const response = await axios.post('/api/users/login', {
        email: 'operario@maflow.es',
        password: '1234Qwerty!!!'
      });
      // Guarda el token y navega a /areas
      localStorage.setItem('token', response.data.token);
      navigate('/areas');
    } catch (error) {
      alert('No se pudo iniciar sesión como Operarios');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-5xl font-bold text-futuristic-text-primary">
          Bienvenido a <span className="text-futuristic-secondary">Helpdesk</span>
        </h1>
        <p className="mt-4 text-lg text-futuristic-text-secondary">
          Plataforma de Soporte de Incidencias
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 w-full">
          <Link 
            to="/login" 
            className="px-8 py-3 font-bold uppercase tracking-wider text-white bg-futuristic-primary rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red w-4/5 max-w-xs text-center">
            Iniciar Sesión
          </Link>
          <Link
            onClick={handleOperariosLogin}
            className="px-8 py-3 font-bold uppercase tracking-wider text-futuristic-secondary border-2 border-futuristic-secondary rounded-lg hover:bg-futuristic-secondary hover:text-futuristic-background transition-all duration-300 transform hover:scale-105 hover:shadow-neon-cyan w-4/5 max-w-xs text-center"
          >
            Operarios
          </Link>
          <Link 
            to="/register" 
            className="px-8 py-3 font-bold uppercase tracking-wider text-futuristic-secondary border-2 border-futuristic-secondary rounded-lg hover:bg-futuristic-secondary hover:text-futuristic-background transition-all duration-300 transform hover:scale-105 hover:shadow-neon-cyan w-4/5 max-w-xs text-center">
            Registrarse
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default App;