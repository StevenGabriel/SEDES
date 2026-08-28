import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import heroBg from '../../assets/hero_bg.jpg';

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[420px] sm:h-[480px] bg-slate-900 overflow-hidden text-white">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Gradient dark overlay for crisp legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/40" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-12">
        {/* Main Text Content */}
        <div className="max-w-2xl mt-4 sm:mt-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Laboratorio Central BioTest
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-xl">
            Especialistas en microbiología y análisis clínicos de alta complejidad. 
            Resultados en línea en 24 horas.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link 
              to="/requisitos"
              className="bg-white hover:bg-slate-100 text-[#005596] font-bold text-xs sm:text-sm tracking-wide px-5 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#005596]" />
              <span>VER DETALLES</span>
            </Link>

            <Link 
              to="/requisitos"
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm tracking-wide px-5 py-2.5 rounded-lg border border-white/40 backdrop-blur-md transition cursor-pointer flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-white/90" />
              <span>REQUISITOS DE LABORATORIOS</span>
            </Link>
          </div>
        </div>

        {/* Carousel Navigation Controls (Bottom Right) */}
        <div className="flex items-center justify-end space-x-4 pb-2">
          {/* Arrow Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              type="button"
              className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center space-x-1.5 pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow" />
            <span className="w-2 h-2 rounded-full bg-white/40" />
            <span className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
