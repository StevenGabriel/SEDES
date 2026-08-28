import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FlaskConical, Shield, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-gradient-to-r from-[#005596] via-[#0077be] to-[#0099e6] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link to="/" className="flex items-center space-x-1.5 cursor-pointer group">
            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight flex items-center">
              SI<span className="text-cyan-300">_Lab</span>
            </span>
          </Link>

          {/* Coat of Arms Badge */}
          <div className="hidden sm:flex items-center pl-3 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-red-500 via-yellow-400 to-green-600 flex items-center justify-center p-0.5 shadow-sm border border-white/50" title="SEDES Cochabamba">
              <Shield className="w-4 h-4 text-white fill-white/20" />
            </div>
          </div>
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-cyan-100 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar Laboratorio"
              className="w-full bg-white/20 text-white placeholder-cyan-100/80 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:bg-white/30 transition-all border border-white/20 backdrop-blur-sm"
              readOnly
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Circular logo/emblem */}
          <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-cyan-700/50 border border-cyan-300/40 text-cyan-200">
            <Shield className="w-4 h-4" />
          </div>

          {/* Login / Register Button */}
          <button 
            type="button"
            className="bg-white hover:bg-slate-100 text-[#005596] font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg shadow transition duration-200 flex items-center space-x-1.5 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Iniciar Sesión / Registrarse</span>
          </button>
        </div>
      </div>
    </header>
  );
}
