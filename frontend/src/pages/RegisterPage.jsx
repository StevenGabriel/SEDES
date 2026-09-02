import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FlaskConical, ArrowLeft, Check } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    ciNit: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Cálculo de fuerza de contraseña (Seguridad)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Ingrese contraseña', color: 'text-slate-400', barColor: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 10) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Débil', color: 'text-red-500', barColor: 'bg-red-500' };
      case 2:
        return { score: 2, text: 'Media', color: 'text-amber-500', barColor: 'bg-amber-500' };
      case 3:
        return { score: 3, text: 'Segura', color: 'text-emerald-600', barColor: 'bg-emerald-500' };
      case 4:
      default:
        return { score: 4, text: 'Muy Segura', color: 'text-emerald-700', barColor: 'bg-emerald-600' };
    }
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMessage('Debe aceptar los Términos y Condiciones para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          ci_nit: formData.ciNit,
          email: formData.email,
          telefono: formData.telefono || null,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocurrió un error al registrar la cuenta.');
      }

      setSuccessMessage('¡Cuenta de Propietario creada exitosamente! Redirigiendo a inicio de sesión...');
      setFormData({
        nombres: '',
        apellidos: '',
        ciNit: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setErrorMessage(err.message || 'No se pudo conectar con el servidor backend.');
    } finally {
      setIsLoading(false);
    }
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
      {/* PANEL DERECHO: Tarjeta de Formulario de Registro                          */}
      {/* ========================================================================= */}
      <section className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-[500px] flex-1 py-8">
        <div className="w-full max-w-[480px] bg-white rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,35,70,0.08)] border border-slate-100/80 transition-all duration-300">
          
          {/* Encabezado del Formulario */}
          <div className="mb-5">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#112233] tracking-tight">
              Crear Cuenta
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Regístrese como propietario de establecimiento.
            </p>
          </div>

          {/* Mensajes de Éxito y Error */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fadeIn">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">!</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulario de Registro */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Fila 1: Nombres y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label 
                  htmlFor="nombres" 
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                >
                  Nombres
                </label>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ej. Carlos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
                />
              </div>

              <div>
                <label 
                  htmlFor="apellidos" 
                  className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                >
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej. Pérez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
                />
              </div>
            </div>

            {/* Fila 2: Número de CI / NIT */}
            <div>
              <label 
                htmlFor="ciNit" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
              >
                Número de CI / NIT
              </label>
              <input
                id="ciNit"
                name="ciNit"
                type="text"
                required
                value={formData.ciNit}
                onChange={handleChange}
                placeholder="Ej. 1234567 LP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
              />
            </div>

            {/* Fila 3: Correo Electrónico */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="propietario@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
              />
            </div>

            {/* Fila 4: Teléfono de Contacto */}
            <div>
              <label 
                htmlFor="telefono" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
              >
                Teléfono de Contacto
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                required
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. 71234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
              />
            </div>

            {/* Fila 5: Contraseña y Medidor de Seguridad */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Indicador de Fuerza de Contraseña */}
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.barColor : 'bg-slate-200'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.barColor : 'bg-slate-200'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.barColor : 'bg-slate-200'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.barColor : 'bg-slate-200'}`} />
                </div>
                <p className={`text-[11px] font-semibold transition-colors ${strength.color}`}>
                  Seguridad: {strength.text}
                </p>
              </div>
            </div>

            {/* Fila 6: Confirmar Contraseña */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
              >
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6] transition-all bg-white hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 cursor-pointer"
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Fila 7: Aceptación de Términos y Condiciones */}
            <div className="pt-1">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
                    formData.acceptTerms 
                      ? 'bg-[#19324d] border-[#19324d] text-white' 
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {formData.acceptTerms && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-[12px] sm:text-xs text-slate-600 leading-snug">
                  Acepto los{' '}
                  <button
                    type="button"
                    onClick={() => alert('Términos y Condiciones del Portal SEDES Cochabamba')}
                    className="text-[#0073c6] hover:text-[#005596] font-semibold hover:underline cursor-pointer"
                  >
                    Términos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button
                    type="button"
                    onClick={() => alert('Política de Privacidad y Protección de Datos SEDES')}
                    className="text-[#0073c6] hover:text-[#005596] font-semibold hover:underline cursor-pointer"
                  >
                    Política de Privacidad
                  </button>.
                </span>
              </label>
            </div>

            {/* Botón: Crear Mi Cuenta */}
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
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <span>Crear Mi Cuenta</span>
                )}
              </button>
            </div>
          </form>

          {/* Enlace para Iniciar Sesión */}
          <div className="mt-5 text-center">
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              ¿Ya tiene cuenta?{' '}
              <Link
                to="/login"
                className="text-[#0073c6] font-bold hover:text-[#005596] hover:underline transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>

          {/* Enlace secundario: Volver al inicio */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
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
