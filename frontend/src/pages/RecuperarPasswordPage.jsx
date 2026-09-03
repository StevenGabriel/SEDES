import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ArrowLeft, Mail, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/solicitar-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocurrió un error al procesar su solicitud.');
      }

      setIsSent(true);
      if (data.dev_link) {
        setDevLink(data.dev_link);
      }

    } catch (err) {
      setErrorMessage(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] font-sans antialiased text-slate-800 select-none sm:select-text">
      
      {/* PANEL IZQUIERDO: Branding Institucional SEDES Cochabamba */}
      <section className="relative lg:w-1/2 min-h-[380px] lg:min-h-screen bg-gradient-to-br from-[#006cb8] via-[#0080d0] to-[#0094e6] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-hidden shadow-xl lg:shadow-2xl">
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="absolute -right-24 -top-20 w-[600px] h-[600px] text-white" viewBox="0 0 600 600" fill="currentColor">
            <path d="M 0,300 C 150,150 350,450 600,300 L 600,0 L 0,0 Z" />
          </svg>
          <svg className="absolute -left-20 -bottom-24 w-[700px] h-[700px] text-white" viewBox="0 0 700 700" fill="currentColor">
            <path d="M 0,350 C 200,500 450,200 700,450 L 700,700 L 0,700 Z" />
          </svg>
        </div>

        {/* Header Superior */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group cursor-pointer" title="Volver al inicio">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 group-hover:bg-white/30 transition-all duration-300 shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight flex items-center">
              SI<span className="text-cyan-200">_Lab</span>
            </span>
          </Link>

          <Link
            to="/login"
            className="lg:hidden inline-flex items-center text-xs font-medium text-white/90 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/25 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Volver
          </Link>
        </div>

        {/* Contenido Central */}
        <div className="relative z-10 my-8 lg:my-auto max-w-xl">
          <div className="flex items-center space-x-2.5 mb-3.5">
            <span className="h-1 w-6 bg-amber-400 rounded-full inline-block"></span>
            <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-cyan-100 drop-shadow-sm">
              PROTECCIÓN Y SEGURIDAD INSTITUCIONAL
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5 drop-shadow-md">
            Recuperación de Contraseña
          </h1>

          <p className="text-blue-50/90 text-sm sm:text-base leading-relaxed max-w-lg font-normal drop-shadow-sm">
            Para su seguridad, le enviaremos un enlace exclusivo y cifrado a su correo electrónico registrado. Dicho enlace tendrá una validez de <strong>10 minutos</strong>.
          </p>
        </div>

        {/* Pie Institucional */}
        <div className="relative z-10 border-t border-white/15 pt-4">
          <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-cyan-200">
            SERVICIO DEPARTAMENTAL DE SALUD
          </p>
          <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">
            Cochabamba • Bolivia
          </p>
        </div>
      </section>

      {/* PANEL DERECHO: Tarjeta de Solicitud de Enlace */}
      <section className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-[500px] flex-1">
        <div className="w-full max-w-[440px] bg-white rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,35,70,0.08)] border border-slate-100/80 transition-all duration-300">
          
          {!isSent ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 text-[#0073c6] rounded-2xl flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#112233] tracking-tight">
                  ¿Olvidó su contraseña?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                  Ingrese su correo electrónico y le enviaremos un enlace de recuperación seguro.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Correo Electrónico Registrado
                  </label>
                  <div className="relative flex items-center">
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
                </div>

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
                        <span>Enviando enlace...</span>
                      </>
                    ) : (
                      <span>Enviar Enlace de Recuperación</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-2 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                ¡Enlace Enviado!
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Hemos enviado un correo a <strong className="text-slate-900">{email}</strong> con las instrucciones para restablecer su clave.
              </p>

              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2 text-left">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tiempo límite:</strong> El enlace tiene una duración de <strong>10 minutos</strong> por motivos de seguridad.
                </span>
              </div>

              {/* Botón de acceso directo en entorno de desarrollo */}
              {devLink && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-left">
                  <p className="text-[11px] font-bold text-blue-900 mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Acceso Directo de Prueba (Dev):
                  </p>
                  <a
                    href={devLink}
                    className="text-xs text-[#0073c6] font-semibold hover:underline break-all block"
                  >
                    Abrir enlace de restablecimiento (10 min)
                  </a>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                >
                  ¿No recibió el correo? Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Pie de navegación */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-semibold text-[#0073c6] hover:text-[#005596] hover:underline transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Volver a Iniciar Sesión
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
