import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Stethoscope,
  Eye,
  Building2
} from 'lucide-react';

export default function MapSection() {
  const [selectedMunicipio, setSelectedMunicipio] = useState('Todos');
  const [laboratorios, setLaboratorios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/establecimientos');
        if (res.ok) {
          const data = await res.json();
          setLaboratorios(data);
        }
      } catch (err) {
        console.error('Error al cargar establecimientos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstablecimientos();
  }, []);

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

  const filteredLabs = selectedMunicipio === 'Todos' 
    ? laboratorios 
    : laboratorios.filter(lab => lab.municipio.toUpperCase() === selectedMunicipio.toUpperCase());

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mapa Georreferenciado de Laboratorios
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Consulte la ubicación, nivel y estado de los laboratorios habilitados en el departamento de Cochabamba.
        </p>
      </div>

      {/* Grid: Map + Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[480px] flex flex-col justify-between">
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

            {/* Marcadores de Laboratorios Reales */}
            {filteredLabs.map((lab, index) => {
              // Distribuir visualmente en el mapa según sus coordenadas relativas
              const posX = `${20 + (index * 15) % 65}%`;
              const posY = `${25 + (index * 18) % 55}%`;
              
              return (
                <Link 
                  to={`/laboratorio/${encodeURIComponent(lab.codigo_cue !== 'Nuevo' ? lab.codigo_cue : lab.id)}`}
                  key={lab.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 hover:z-30 transition-all"
                  style={{ left: posX, top: posY }}
                  title={`Ver detalle de ${lab.nombre_comercial}`}
                >
                  <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap mb-1 hover:scale-105 transition-transform">
                    <span className={`w-2 h-2 rounded-full ${lab.estado_operativo === 'Habilitado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{lab.nombre_comercial}</span>
                  </div>

                  <div className="flex justify-center -mt-1">
                    <div className="bg-white p-1 rounded-full shadow-md group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-red-600 fill-red-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Watermark de Mapa */}
          <div className="relative p-4 flex justify-between items-end pointer-events-none mt-auto">
            <div className="bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-700 px-3 py-1.5 rounded-xl shadow-xs border border-white">
              📍 PostGIS SRID:4326 • Cochabamba, Bolivia
            </div>
          </div>
        </div>

        {/* Sidebar Filters & Results Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Filtros Espaciales</h3>
            <p className="text-xs text-slate-500">Consulte por municipio y estado de habilitación.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              MUNICIPIO
            </label>
            <div className="relative">
              <select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0077be] cursor-pointer font-medium"
              >
                <option value="Todos">Todos los Municipios</option>
                <option value="CERCADO">Cercado</option>
                <option value="QUILLACOLLO">Quillacollo</option>
                <option value="PUNATA">Punata</option>
                <option value="SHINAHOTA">Shinahota</option>
                <option value="VILLA TUNARI">Villa Tunari</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold tracking-wide text-slate-400 uppercase">LABORATORIOS OFICIALES</span>
            <span className="font-bold text-[#005596] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {filteredLabs.length} registrados
            </span>
          </div>

          {/* Lista de Laboratorios Reales */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-xs text-slate-400 text-center py-4">Cargando laboratorios...</p>
            ) : filteredLabs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No se encontraron laboratorios para este filtro.</p>
            ) : (
              filteredLabs.map((lab) => (
                <div 
                  key={lab.id} 
                  className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{lab.nombre_comercial}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      lab.estado_operativo === 'Habilitado' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lab.estado_operativo === 'Habilitado' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                      {lab.estado_operativo}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-normal line-clamp-1">{lab.direccion}</p>
                  
                  <div className="text-[11px] text-[#005596] font-semibold flex items-center justify-between">
                    <span>CUE: {lab.codigo_cue}</span>
                    <span>{lab.municipio} • {lab.nivel}</span>
                  </div>

                  <div className="pt-1">
                    <Link
                      to={`/laboratorio/${encodeURIComponent(lab.codigo_cue !== 'Nuevo' ? lab.codigo_cue : lab.id)}`}
                      className="w-full bg-white hover:bg-slate-100 text-[#005596] text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#005596]" />
                      <span>Ver Detalles Oficiales</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
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
