import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RequisitosPage from './pages/RequisitosPage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/RegisterPage';
import PropietarioPage from './pages/PropietarioPage';
import RecuperarPasswordPage from './pages/RecuperarPasswordPage';
import RestablecerPasswordPage from './pages/RestablecerPasswordPage';
import DetalleLaboratorioPage from './pages/DetalleLaboratorioPage';
import SupervisorPage from './pages/SupervisorPage';
import CoordinadorPage from './pages/CoordinadorPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landingpage" element={<LandingPage />} />
      <Route path="/requisitos" element={<RequisitosPage />} />
      <Route path="/laboratorio/:id" element={<DetalleLaboratorioPage />} />
      <Route path="/laboratorios/:id" element={<DetalleLaboratorioPage />} />
      <Route path="/laboratorio-central-biotest" element={<DetalleLaboratorioPage />} />
      <Route path="/detalle-laboratorio" element={<DetalleLaboratorioPage />} />
      <Route path="/detalle-laboratorio/:id" element={<DetalleLaboratorioPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/loginpage" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/registerpage" element={<RegisterPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
      <Route path="/recuperar-contrasena" element={<RecuperarPasswordPage />} />
      <Route path="/restablecer-password" element={<RestablecerPasswordPage />} />
      <Route path="/restablecer-contrasena" element={<RestablecerPasswordPage />} />
      <Route path="/propietario" element={<Navigate to="/propietario/mis-establecimientos" replace />} />
      <Route path="/propietario/:seccion" element={<PropietarioPage />} />
      <Route path="/propietariopage" element={<Navigate to="/propietario/mis-establecimientos" replace />} />
      <Route path="/dashboard" element={<Navigate to="/propietario/mis-establecimientos" replace />} />
      <Route path="/supervisor" element={<Navigate to="/supervisor/mi-agenda" replace />} />
      <Route path="/supervisor/:seccion" element={<SupervisorPage />} />
      <Route path="/coordinador" element={<Navigate to="/coordinador/bandeja" replace />} />
      <Route path="/coordinador/:seccion" element={<CoordinadorPage />} />
      <Route path="/coordinadorpage" element={<Navigate to="/coordinador/bandeja" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/admin/:seccion" element={<AdminPage />} />
      <Route path="/adminpage" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/administrador" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/administrador/:seccion" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
