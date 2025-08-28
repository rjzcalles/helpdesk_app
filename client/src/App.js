import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    // El fondo y el color de texto base se controlan desde index.css en el body
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />

        {/* Rutas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

const HomePage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="text-center animate-fade-in-up">
      <h1 className="text-5xl font-bold text-futuristic-text-primary">
        Bienvenido a <span className="text-futuristic-secondary">Helpdesk</span>
      </h1>
      <p className="mt-4 text-lg text-futuristic-text-secondary">
        Plataforma de Soporte para el Gemelo Digital
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 w-full">
        <Link 
          to="/login" 
          className="px-8 py-3 font-bold uppercase tracking-wider text-white bg-futuristic-primary rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-neon-red w-4/5 max-w-xs text-center">
          Iniciar Sesión
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

export default App;
