import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FlaskConical, ArrowLeft, Check } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    // Simulación de autenticación
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Inicio de sesión exitoso. Redirigiendo...');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] font-sans antialiased text-slate-800 select-none sm:select-text">
      
      {/* ========================================================================= */}
      {/* PANEL IZQUIERDO: Branding Institucional SEDES Cochabamba                  */}
      {/* ========================================================================= */}
      <section className="relative lg:w-1/2 min-h-[380px] lg:min-h-screen bg-gradient-to-br from-[#006cb8] via-[#0080d0] to-[#0094e6] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-hidden shadow-xl lg:shadow-2xl">
        
        {/* Curvas y Ondas de Fondo Abstractas (Diseño Figma / Mockup) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="absolute -right-24 -top-20 w-[600px] h-[600px] text-white" viewBox="0 0 600 600" fill="currentColor">
            <path d="M 0,300 C 150,150 350,450 600,300 L 600,0 L 0,0 Z" />
          </svg>
          <svg className="absolute -left-20 -bottom-24 w-[700px] h-[700px] text-white" viewBox="0 0 700 700" fill="currentColor">
            <path d="M 0,350 C 200,500 450,200 700,450 L 700,700 L 0,700 Z" />
          </svg>
        </div>

        {/* 1. Header Superior: Logo SI_Lab y enlace al portal */}
        <div className="relative z-10 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2.5 group cursor-pointer"
            title="Volver a la página principal"
          >
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 group-hover:bg-white/30 transition-all duration-300 shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight flex items-center">
              SI<span className="text-cyan-200">_Lab</span>
            </span>
          </Link>

          <Link
            to="/"
            className="lg:hidden inline-flex items-center text-xs font-medium text-white/90 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/25 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Inicio
          </Link>
        </div>

        {/* 2. Cuerpo Central: Información del Portal y Título */}
        <div className="relative z-10 my-8 lg:my-auto max-w-xl">
          {/* Subtítulo institucional con barra indicadora naranja */}
          <div className="flex items-center space-x-2.5 mb-3.5">
            <span className="h-1 w-6 bg-amber-400 rounded-full inline-block"></span>
            <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-cyan-100 drop-shadow-sm">
              GOBIERNO AUTÓNOMO DEPARTAMENTAL
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5 drop-shadow-md">
            Portal Único de Trámites y Requisitos
          </h1>

          {/* Descripción */}
          <p className="text-blue-50/90 text-sm sm:text-base leading-relaxed max-w-lg font-normal drop-shadow-sm">
            Gestione la apertura, renovación y acreditación de establecimientos de salud, 
            laboratorios y farmacias de manera 100% digital en Cochabamba.
          </p>
        </div>

        {/* 3. Footer Inferior: Pie Institucional */}
        <div className="relative z-10 border-t border-white/15 pt-4">
          <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-cyan-200">
            SERVICIO DEPARTAMENTAL DE SALUD
          </p>
          <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">
            Cochabamba • Bolivia
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PANEL DERECHO: Tarjeta de Formulario de Inicio de Sesión                  */}
      {/* ========================================================================= */}
      <section className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-[500px] flex-1">
        <div className="w-full max-w-[430px] bg-white rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,35,70,0.08)] border border-slate-100/80 transition-all duration-300">
          
          {/* Encabezado del Formulario */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#112233] tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Acceda a su cuenta para gestionar sus trámites.
            </p>
          </div>

          {/* Mensaje de Éxito / Feedback */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fadeIn">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Correo Electrónico */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
              />
            </div>

            {/* Campo: Contraseña */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Opciones: Recordar sesión y Recuperar contraseña */}
            <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
              <label className="flex items-center space-x-2 cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
                    rememberMe 
                      ? 'bg-[#19324d] border-[#19324d] text-white' 
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-slate-600 font-medium text-xs sm:text-sm">
                  Recordar mi sesión
                </span>
              </label>

              <button
                type="button"
                onClick={() => alert('Función de recuperación de contraseña en proceso de habilitación.')}
                className="text-[#0073c6] hover:text-[#005596] font-medium text-xs sm:text-sm hover:underline transition-colors cursor-pointer"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Botón de Iniciar Sesión */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#19324d] hover:bg-[#122438] active:bg-[#0c1827] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </div>
          </form>

          {/* Enlace para Registro */}
          <div className="mt-7 text-center">
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              ¿No tiene cuenta?{' '}
              <button
                type="button"
                onClick={() => alert('El registro de nuevos regentes y establecimientos estará disponible próximamente.')}
                className="text-[#0073c6] font-bold hover:text-[#005596] hover:underline transition-colors cursor-pointer"
              >
                Registrarse aquí
              </button>
            </p>
          </div>

          {/* Botón secundario: Volver al inicio */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Volver al portal principal
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
