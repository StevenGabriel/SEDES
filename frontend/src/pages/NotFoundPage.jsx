import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Home, FileText, LogIn, ArrowLeft, Search, ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans antialiased text-slate-800 select-none sm:select-text">
      
      {/* 1. Header Superior Institucional */}
      <header className="bg-gradient-to-r from-[#005596] via-[#0073c6] to-[#008fe6] text-white py-4 px-6 sm:px-12 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group cursor-pointer" title="Volver al inicio">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 group-hover:bg-white/30 transition-all duration-300 shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight flex items-center">
              SI<span className="text-cyan-200">_Lab</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            <Link 
              to="/requisitos"
              className="text-white/90 hover:text-white hover:underline transition hidden sm:inline-flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Requisitos
            </Link>
            <Link 
              to="/login"
              className="bg-white text-[#006cb8] hover:bg-cyan-50 px-4 py-2 rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Cuerpo Central 404 */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fadeIn">
          
          {/* Gráfico / Número 404 Estilizado */}
          <div className="relative inline-block">
            <div className="text-[100px] sm:text-[140px] font-black tracking-tighter text-slate-200 select-none leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-[#006cb8] to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 text-white transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Textos descriptivos */}
          <div className="space-y-3 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Search className="w-3.5 h-3.5" /> Página no encontrada
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#112233] tracking-tight">
              Recurso o Dirección No Disponible
            </h1>
            
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              La página o trámite que está buscando no existe, ha sido reubicada o el enlace ingresado contiene un error tipográfico.
            </p>
          </div>

          {/* Botones de acción directa */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Regresar Atrás
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0073c6] hover:bg-[#005fa8] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ir al Inicio (Landing)
            </Link>

            <Link
              to="/requisitos"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver Requisitos
            </Link>
          </div>

          {/* Asistencia Institucional */}
          <div className="border-t border-slate-200/80 pt-6 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              ¿Necesita ayuda con un trámite oficial de laboratorio? <br />
              Comuníquese con el <strong>Servicio Departamental de Salud (SEDES Cochabamba)</strong>.
            </p>
          </div>

        </div>
      </main>

      {/* 3. Footer Oficial */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          © 2026 Servicio Departamental de Salud (SEDES Cochabamba) • Estado Plurinacional de Bolivia
        </p>
      </footer>

    </div>
  );
}
