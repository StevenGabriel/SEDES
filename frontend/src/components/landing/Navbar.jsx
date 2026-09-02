import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FlaskConical } from 'lucide-react';
import logoL1 from '../../assets/L1.png';
import logoL2 from '../../assets/L2.png';

export default function Navbar() {
  return (
    <header className="bg-gradient-to-r from-[#005596] via-[#0077be] to-[#0099e6] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Lado Izquierdo: SI_Lab y Escudo L1 */}
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer group" title="Inicio">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
              SI_Lab
            </span>
          </Link>

          {/* Escudo L1 */}
          <div className="flex items-center pl-1 sm:pl-2">
            <img 
              src={logoL1} 
              alt="Escudo Institucional SEDES" 
              className="h-10 sm:h-12 md:h-13 w-auto object-contain drop-shadow-sm" 
              title="Escudo Institucional SEDES"
            />
          </div>
        </div>

        {/* Centro: Barra de Búsqueda */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 text-white/80 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar Laboratorio"
              className="w-full bg-white/20 hover:bg-white/25 focus:bg-white/30 text-white placeholder-white/80 text-xs sm:text-sm rounded-xl pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all border border-white/30 backdrop-blur-sm"
              readOnly
            />
          </div>
        </div>

        {/* Lado Derecho: Logo L2 y Botón Iniciar Sesión / Registrarse */}
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          {/* Logo Cochabamba L2 */}
          <div className="hidden md:flex items-center">
            <img 
              src={logoL2} 
              alt="Gobierno Autónomo Departamental de Cochabamba" 
              className="h-10 sm:h-12 md:h-13 w-auto object-contain drop-shadow-sm" 
              title="Gobierno Autónomo Departamental de Cochabamba"
            />
          </div>

          {/* Botón Iniciar Sesión / Registrarse */}
          <Link 
            to="/login"
            className="bg-white hover:bg-slate-100 text-[#005596] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer whitespace-nowrap"
          >
            Iniciar Sesión / Registrarse
          </Link>
        </div>

      </div>
    </header>
  );
}
