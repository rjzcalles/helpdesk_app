import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
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
    </div>
  );
}

const HomePage = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white">
        Bienvenido a <span className="text-blue-400">HelpDesk Maflow</span>
      </h1>
      <p className="mt-4 text-lg text-gray-400">Soluciones de soporte para la industria 4.0</p>
      <div className="mt-8 space-x-4">
        <Link to="/login" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Iniciar Sesión
        </Link>
        <Link to="/register" className="px-6 py-2 font-semibold text-blue-400 border border-blue-400 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
          Registrarse
        </Link>
      </div>
    </div>
  </div>
);

export default App;