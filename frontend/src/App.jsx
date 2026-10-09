import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import DirectorPage from './pages/DirectorPage';
import AbogadoPage from './pages/AbogadoPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Componente que sincroniza la sesión activa en tiempo real entre pestañas del mismo navegador.
 * Evita que existan 2 roles o usuarios distintos abiertos al mismo tiempo en diferentes pestañas.
 */
function SessionSyncHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Si otra pestaña cerró sesión o inició sesión con otro usuario/token
      if (e.key === 'token' || e.key === 'usuario') {
        const token = localStorage.getItem('token');
        const usuarioStr = localStorage.getItem('usuario');

        // Si se cerró la sesión en otra pestaña
        if (!token || !usuarioStr) {
          const publicRoutes = ['/', '/landingpage', '/requisitos', '/login', '/loginpage', '/register', '/registerpage', '/registro', '/recuperar-password', '/recuperar-contrasena', '/restablecer-password', '/restablecer-contrasena'];
          const isPublic = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/laboratorio/');
          if (!isPublic) {
            navigate('/login');
          }
          return;
        }

        // Si se cambió de usuario en otra pestaña, redirigir al panel correspondiente del nuevo usuario
        try {
          const nuevoUsuario = JSON.parse(usuarioStr);
          const rol = (nuevoUsuario.rol_nombre || nuevoUsuario.rol || '').toLowerCase();
          const currentPath = location.pathname.toLowerCase();

          const rolMatch = (
            (rol.includes('admin') && currentPath.startsWith('/admin')) ||
            (rol.includes('director') && currentPath.startsWith('/director')) ||
            ((rol.includes('abogado') || rol.includes('legal')) && currentPath.startsWith('/abogado')) ||
            (rol.includes('supervisor') && currentPath.startsWith('/supervisor')) ||
            (rol.includes('coordinador') && currentPath.startsWith('/coordinador')) ||
            (rol.includes('propietario') && currentPath.startsWith('/propietario'))
          );

          if (!rolMatch && !['/', '/landingpage', '/requisitos'].includes(currentPath)) {
            if (rol.includes('admin')) navigate('/admin');
            else if (rol.includes('director')) navigate('/director');
            else if (rol.includes('abogado') || rol.includes('legal')) navigate('/abogado/informes-recibidos');
            else if (rol.includes('supervisor')) navigate('/supervisor');
            else if (rol.includes('coordinador')) navigate('/coordinador');
            else if (rol.includes('propietario')) navigate('/propietario');
          }
        } catch (err) {
          console.error('Error al sincronizar sesión entre pestañas:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <>
      <SessionSyncHandler />
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
      <Route path="/director" element={<Navigate to="/director/consola-administracion" replace />} />
      <Route path="/director/:seccion" element={<DirectorPage />} />
      <Route path="/directorpage" element={<Navigate to="/director/consola-administracion" replace />} />
      <Route path="/abogado" element={<Navigate to="/abogado/informes-recibidos" replace />} />
      <Route path="/abogado/:seccion" element={<AbogadoPage />} />
      <Route path="/abogadopage" element={<Navigate to="/abogado/informes-recibidos" replace />} />
      <Route path="/asesor-legal" element={<Navigate to="/abogado/informes-recibidos" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/admin/:seccion" element={<AdminPage />} />
      <Route path="/adminpage" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/administrador" element={<Navigate to="/admin/usuarios" replace />} />
      <Route path="/administrador/:seccion" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}

export default App;
