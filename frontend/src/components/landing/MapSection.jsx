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
  Clock,
  X
} from 'lucide-react';
import RealMultiMapView, { getLabSpecialty, checkEstaAbierto, ESPECIALIDADES_MAPA } from '../common/RealMultiMapView';

export default function MapSection() {
  const [selectedMunicipio, setSelectedMunicipio] = useState('Todos');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [laboratorios, setLaboratorios] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar todos los laboratorios registrados desde el Backend
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
    { id: 1, key: 'GENERAL', name: 'LABORATORIO CLÍNICO GENERAL', shortName: 'Clínico General', icon: Microscope, color: 'bg-teal-700', hex: '#0f766e' },
    { id: 2, key: 'MICROBIOLOGIA', name: 'LABORATORIO CLÍNICO MICROBIOLÓGICO', shortName: 'Microbiológico', icon: Biohazard, color: 'bg-indigo-900', hex: '#312e81' },
    { id: 3, key: 'ANATOMIA', name: 'LABORATORIO DE ANATOMÍA PATOLÓGICA Y CITOLOGÍA', shortName: 'Patología / Citología', icon: Stethoscope, color: 'bg-purple-700', hex: '#7e22ce' },
    { id: 4, key: 'HEMATOLOGIA', name: 'LABORATORIO DE HEMATOLOGÍA', shortName: 'Hematología', icon: Droplet, color: 'bg-red-700', hex: '#b91c1c' },
    { id: 5, key: 'INMUNOLOGIA', name: 'LABORATORIO DE INMUNOLOGÍA', shortName: 'Inmunología', icon: Activity, color: 'bg-sky-600', hex: '#0284c7' },
    { id: 6, key: 'ENDOCRINOLOGIA', name: 'LABORATORIO DE ENDOCRINOLOGÍA', shortName: 'Endocrinología', icon: Scale, color: 'bg-lime-600', hex: '#65a30d' },
    { id: 7, key: 'GENETICA', name: 'LABORATORIO DE GENÉTICA', shortName: 'Genética', icon: Dna, color: 'bg-slate-800', hex: '#1e293b' },
    { id: 8, key: 'TOXICOLOGIA', name: 'LABORATORIO DE TOXICOLOGÍA', shortName: 'Toxicología', icon: TestTube2, color: 'bg-amber-600', hex: '#d97706' },
  ];

  // Filtrado combinado por municipio y especialidad
  const filteredLabs = laboratorios.filter(lab => {
    const matchMunicipio = selectedMunicipio === 'Todos' || (lab.municipio || '').toUpperCase() === selectedMunicipio.toUpperCase();
    
    if (!matchMunicipio) return false;
    if (!selectedEspecialidad) return true;

    const esp = getLabSpecialty(lab);
    return esp.id === selectedEspecialidad.id;
  });

  // Extraer lista de municipios únicos presentes en los datos
  const municipiosDisponibles = ['Todos', ...new Set(laboratorios.map(l => l.municipio).filter(Boolean))];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mapa Georreferenciado de Laboratorios
        </h2>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Consulte la ubicación, nivel y horario de atención de los laboratorios habilitados en el departamento de Cochabamba.
        </p>
      </div>

      {/* Grid: Real Map + Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Mapa Real Georreferenciado con Leaflet + OpenStreetMap */}
        <div className="lg:col-span-8 min-h-[480px] h-[520px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
          <RealMultiMapView
            laboratorios={filteredLabs}
            selectedLab={selectedLab}
            onSelectLab={(lab) => setSelectedLab(lab)}
            selectedMunicipio={selectedMunicipio}
            height="100%"
          />
        </div>

        {/* Sidebar Filters & Results Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 max-h-[520px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Filtros Espaciales</h3>
              <p className="text-xs text-slate-500">Consulte por municipio y tipo de especialidad.</p>
            </div>

            {/* Selector de Municipio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                MUNICIPIO
              </label>
              <div className="relative">
                <select
                  value={selectedMunicipio}
                  onChange={(e) => {
                    setSelectedMunicipio(e.target.value);
                    setSelectedLab(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0077be] cursor-pointer font-medium"
                >
                  <option value="Todos">Todos los Municipios</option>
                  {municipiosDisponibles.filter(m => m !== 'Todos').map((mun) => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Filtro de Especialidad Activo */}
            {selectedEspecialidad && (
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEspecialidad.hex }} />
                  <span className="font-bold text-slate-700">{selectedEspecialidad.shortName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEspecialidad(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition cursor-pointer"
                  title="Quitar filtro de especialidad"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Contador de Laboratorios */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold tracking-wide text-slate-400 uppercase">LABORATORIOS OFICIALES</span>
              <span className="font-bold text-[#005596] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {filteredLabs.length} registrados
              </span>
            </div>
          </div>

          {/* Lista Scrollable de Laboratorios Reales */}
          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-[#0073c6] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Cargando laboratorios en el mapa...</p>
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-500">No se encontraron laboratorios con estos filtros.</p>
                {selectedEspecialidad && (
                  <button
                    onClick={() => setSelectedEspecialidad(null)}
                    className="text-xs font-bold text-[#005596] hover:underline"
                  >
                    Ver todas las especialidades
                  </button>
                )}
              </div>
            ) : (
              filteredLabs.map((lab) => {
                const isSelected = selectedLab && selectedLab.id === lab.id;
                const especialidad = getLabSpecialty(lab);
                const estadoHorario = checkEstaAbierto(lab.horario);

                return (
                  <div 
                    key={lab.id} 
                    onClick={() => setSelectedLab(lab)}
                    className={`rounded-xl p-3.5 border transition cursor-pointer space-y-2.5 ${
                      isSelected 
                        ? 'bg-blue-50/90 border-[#0073c6] shadow-xs ring-2 ring-[#0073c6]/30' 
                        : 'bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{lab.nombre_comercial}</h4>
                      
                      {/* Badge de Horario: Abierto Ahora / Cerrado */}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        estadoHorario.abierto 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${estadoHorario.abierto ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                        {estadoHorario.texto}
                      </span>
                    </div>

                    {/* Insignia de Especialidad y Horario */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${especialidad.colorHex}15`,
                          color: especialidad.colorHex,
                          borderColor: `${especialidad.colorHex}35`
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: especialidad.colorHex }}></span>
                        <span>{especialidad.shortName}</span>
                      </span>

                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{lab.horario || 'Lun-Vie 7:00-19:00'}</span>
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-normal line-clamp-1">{lab.direccion || 'Cochabamba'}</p>
                    
                    <div className="text-[11px] text-[#005596] font-semibold flex items-center justify-between">
                      <span className="font-mono">CUE: {lab.codigo_cue || '3L0267'}</span>
                      <span>{lab.municipio} • {lab.nivel || 'Nivel 1'}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lab.latitud},${lab.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-white hover:bg-blue-50/80 text-[#005596] text-xs font-bold py-2 px-3 rounded-lg border border-slate-200 hover:border-[#005596]/40 flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer"
                        title={`Obtener indicaciones GPS para llegar a ${lab.nombre_comercial}`}
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#005596]" />
                        <span>Cómo llegar (GPS)</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLab(lab);
                        }}
                        className="p-2 bg-[#005596] text-white hover:bg-[#003e6d] rounded-lg transition shadow-2xs cursor-pointer"
                        title="Ubicar en el mapa"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel: LEYENDA INTERACTIVA DE TIPOS DE LABORATORIO */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            | LEYENDA DE TIPOS DE LABORATORIO (Haga clic para filtrar en el mapa)
          </h3>
          {selectedEspecialidad && (
            <button
              type="button"
              onClick={() => setSelectedEspecialidad(null)}
              className="text-xs font-bold text-[#005596] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Mostrar todos
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isCategoryActive = selectedEspecialidad && selectedEspecialidad.id === cat.id;

            return (
              <button
                key={cat.id} 
                type="button"
                onClick={() => {
                  if (isCategoryActive) {
                    setSelectedEspecialidad(null);
                  } else {
                    setSelectedEspecialidad(cat);
                    setSelectedLab(null);
                  }
                }}
                className={`flex flex-col items-center space-y-2.5 group cursor-pointer p-2 rounded-xl transition-all ${
                  isCategoryActive 
                    ? 'bg-blue-50/90 ring-2 ring-[#0073c6] shadow-xs scale-105' 
                    : 'hover:bg-slate-50 opacity-85 hover:opacity-100'
                }`}
                title={`Filtrar por ${cat.shortName}`}
              >
                <div 
                  className="w-13 h-13 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: cat.hex }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-700 leading-tight tracking-tight uppercase max-w-[110px]">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
