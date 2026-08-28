import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ChevronDown, 
  Microscope, 
  Biohazard, 
  Dna, 
  Droplet, 
  Activity, 
  Scale, 
  TestTube2, 
  Stethoscope 
} from 'lucide-react';

export default function MapSection() {
  const [selectedCategory, setSelectedCategory] = useState('Todos los tipos');

  const mapMarkers = [
    { id: 1, name: 'Laboratorio MAXILAB', type: 'Endocrinología', status: 'Abierto', x: '35%', y: '25%', color: 'bg-emerald-500' },
    { id: 2, name: 'Laboratorio del Norte', type: 'Clínico General', status: 'Abierto', x: '52%', y: '22%', color: 'bg-emerald-500' },
    { id: 3, name: 'Laboratorio Umbrella', type: 'Microbiológico', status: 'Abierto', x: '20%', y: '34%', color: 'bg-rose-500' },
    { id: 4, name: 'Laboratorio San Juan', type: 'Hematología', status: 'Abierto', x: '62%', y: '39%', color: 'bg-emerald-500' },
    { id: 5, name: 'Laboratorio Central', type: 'Hematología', status: 'Cerrado', x: '42%', y: '44%', color: 'bg-rose-600' },
    { id: 6, name: 'Laboratorio Universo', type: 'Genética', status: 'Abierto', x: '21%', y: '52%', color: 'bg-amber-500' },
    { id: 7, name: 'Laboratorio España', type: 'Inmunología', status: 'Abierto', x: '34%', y: '57%', color: 'bg-sky-500' },
    { id: 8, name: 'Laboratorio del Sol', type: 'Toxicología', status: 'Abierto', x: '13%', y: '64%', color: 'bg-orange-500' },
    { id: 9, name: 'Laboratorio Los Ángeles', type: 'Anatomía Patológica', status: 'Abierto', x: '55%', y: '62%', color: 'bg-purple-600' },
  ];

  const categories = [
    { id: 1, name: 'LABORATORIO CLÍNICO GENERAL', icon: Microscope, color: 'bg-teal-700' },
    { id: 2, name: 'LABORATORIO CLÍNICO MICROBIOLÓGICO', icon: Biohazard, color: 'bg-indigo-900' },
    { id: 3, name: 'LABORATORIO DE ANATOMÍA PATOLÓGICA Y CITOLOGÍA', icon: Stethoscope, color: 'bg-purple-700' },
    { id: 4, name: 'LABORATORIO DE HEMATOLOGÍA', icon: Droplet, color: 'bg-red-700' },
    { id: 5, name: 'LABORATORIO DE INMUNOLOGÍA', icon: Activity, color: 'bg-sky-600' },
    { id: 6, name: 'LABORATORIO DE ENDOCRINOLOGÍA', icon: Scale, color: 'bg-lime-600' },
    { id: 7, name: 'LABORATORIO DE GENÉTICA', icon: Dna, color: 'bg-slate-800' },
    { id: 8, name: 'LABORATORIO DE TOXICOLOGÍA', icon: TestTube2, color: 'bg-amber-600' },
  ];

  const labList = [
    { id: 1, name: 'Laboratorio San Juan', status: 'Abierto', address: 'Av. Heroínas #450, Cochabamba' },
    { id: 2, name: 'Laboratorio del Norte', status: 'Abierto', address: 'Av. Circunvalación, Zona Temporal' },
    { id: 3, name: 'Laboratorio Central', status: 'Cerrado', address: 'Calle España #120, Cochabamba' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mapa de Laboratorios
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Consulte la ubicación, tipo y estado de los laboratorios habilitados en Cochabamba.
        </p>
      </div>

      {/* Grid: Map + Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[460px] flex flex-col justify-between">
          {/* Stylized SVG Street Map of Cochabamba */}
          <div className="absolute inset-0 bg-[#e5e9ec] overflow-hidden">
            {/* River Rocha Vector */}
            <svg className="absolute w-full h-full text-cyan-200/80 stroke-current" viewBox="0 0 800 500" fill="none">
              <path d="M -50 150 Q 200 120, 300 280 T 600 350 T 900 480" strokeWidth="24" strokeLinecap="round" />
            </svg>

            {/* Park Green Areas */}
            <div className="absolute top-[28%] left-[62%] w-24 h-24 rounded-full bg-emerald-200/50 blur-xs border border-emerald-300/40" />
            <div className="absolute top-[48%] left-[10%] w-32 h-20 rounded-2xl bg-emerald-200/40 blur-xs border border-emerald-300/40" />

            {/* Grid Streets Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-white stroke-[3.5] opacity-90" viewBox="0 0 800 500">
              <line x1="120" y1="0" x2="150" y2="500" />
              <line x1="240" y1="0" x2="270" y2="500" />
              <line x1="360" y1="0" x2="390" y2="500" />
              <line x1="480" y1="0" x2="510" y2="500" />
              <line x1="600" y1="0" x2="630" y2="500" />
              <line x1="720" y1="0" x2="750" y2="500" />

              <line x1="0" y1="80" x2="800" y2="100" />
              <line x1="0" y1="180" x2="800" y2="200" />
              <line x1="0" y1="280" x2="800" y2="300" />
              <line x1="0" y1="380" x2="800" y2="400" />
              <line x1="0" y1="460" x2="800" y2="480" />

              <line x1="0" y1="220" x2="800" y2="240" stroke="#f1f5f9" strokeWidth="7" />
              <line x1="300" y1="0" x2="330" y2="500" stroke="#f1f5f9" strokeWidth="7" />
            </svg>

            {/* Street Labels */}
            <span className="absolute top-[18%] left-[45%] text-[10px] font-semibold text-slate-400 rotate-[-12deg]">Av. Heroínas</span>
            <span className="absolute top-[55%] left-[25%] text-[10px] font-semibold text-slate-400">Av. Ayacucho</span>
            <span className="absolute top-[35%] left-[68%] text-[10px] font-semibold text-slate-400">Hospital Viedma</span>
            <span className="absolute top-[8%] left-[28%] text-[10px] font-semibold text-cyan-700">Río Rocha</span>

            {/* Dynamic Map Pins */}
            {mapMarkers.map((marker) => (
              <div 
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 hover:z-30 transition-all"
                style={{ left: marker.x, top: marker.y }}
              >
                {/* Pin Label Badge */}
                <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap mb-1 hover:scale-105 transition-transform">
                  <span className={`w-2 h-2 rounded-full ${marker.color}`} />
                  <span>{marker.name}</span>
                </div>

                {/* Map Pointer Icon */}
                <div className="flex justify-center -mt-1">
                  <div className="bg-white p-1 rounded-full shadow-md">
                    <MapPin className="w-5 h-5 text-red-600 fill-red-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Controls Watermark */}
          <div className="relative p-4 flex justify-between items-end pointer-events-none mt-auto">
            <div className="bg-white/80 backdrop-blur-md text-[11px] font-medium text-slate-600 px-3 py-1.5 rounded-lg shadow-xs border border-white">
              Cochabamba, Bolivia • Vista de Mapa Habilitada
            </div>
          </div>
        </div>

        {/* Sidebar Filters & Results Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Filtros Espaciales</h3>
            <p className="text-xs text-slate-500">Filtre por tipo de centro y estado de habilitación.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TIPO DE LABORATORIOS
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0077be] cursor-pointer font-medium"
              >
                <option value="Todos los tipos">Todos los tipos</option>
                <option value="Clínico General">Clínico General</option>
                <option value="Microbiológico">Microbiológico</option>
                <option value="Hematología">Hematología</option>
                <option value="Inmunología">Inmunología</option>
                <option value="Endocrinología">Endocrinología</option>
                <option value="Genética">Genética</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold tracking-wide text-slate-400 uppercase">RESULTADOS EN MAPA</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">5 encontrados</span>
          </div>

          <div className="space-y-3">
            {labList.map((lab) => (
              <div 
                key={lab.id} 
                className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2.5 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{lab.name}</h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    lab.status === 'Abierto' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${lab.status === 'Abierto' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    {lab.status}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 font-normal">{lab.address}</p>

                {lab.status === 'Abierto' && (
                  <button 
                    type="button"
                    className="w-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#005596]" />
                    <span>Iniciar Navegación</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panel: LEYENDA DE TIPOS DE LABORATORIO */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            | LEYENDA DE TIPOS DE LABORATORIO
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div key={cat.id} className="flex flex-col items-center space-y-2.5 group cursor-pointer">
                <div className={`${cat.color} w-13 h-13 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-700 leading-tight tracking-tight uppercase max-w-[110px]">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
