import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RequisitosPage from './pages/RequisitosPage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landingpage" element={<LandingPage />} />
      <Route path="/requisitos" element={<RequisitosPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/loginpage" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/registerpage" element={<RegisterPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
