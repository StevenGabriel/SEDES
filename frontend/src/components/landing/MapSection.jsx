import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Search,
  Check,
  Building2,
  Sparkles
} from 'lucide-react';
import RealMultiMapView, { getLabSpecialty, getLabSpecialties, checkEstaAbierto, ESPECIALIDADES_MAPA } from '../common/RealMultiMapView';

// Catálogo estructurado de las 5 regiones oficiales de Cochabamba y sus 47 municipios
export const REGIONES_MUNICIPIOS = [
  {
    region: 'Región Metropolitana',
    icono: '🏙️',
    municipios: ['Cercado', 'Sacaba', 'Quillacollo', 'Colcapirhua', 'Tiquipaya', 'Vinto', 'Sipe Sipe']
  },
  {
    region: 'Valle Alto',
    icono: '🌾',
    municipios: ['Punata', 'Cliza', 'Tarata', 'Arani', 'Arbieto', 'Tolata', 'San Benito', 'Toco', 'Villa Rivero', 'Tacachi', 'Cuchumuela', 'Anzaldo', 'Santiváñez']
  },
  {
    region: 'Trópico de Cochabamba',
    icono: '🌴',
    municipios: ['Villa Tunari', 'Shinahota', 'Chimoré', 'Puerto Villarroel', 'Entre Ríos']
  },
  {
    region: 'Cono Sur',
    icono: '⛰️',
    municipios: ['Aiquile', 'Mizque', 'Totora', 'Pasorapa', 'Omereque', 'Pocona', 'Pojo', 'Vacas', 'Alalay', 'Vila Vila']
  },
  {
    region: 'Zona Andina y Valles',
    icono: '🏔️',
    municipios: ['Capinota', 'Arque', 'Tapacarí', 'Bolívar', 'Independencia', 'Morochata', 'Cocapata', 'Sicaya', 'Tacopaya']
  }
];

export const CATALOGO_MUNICIPIOS = [
  'Todos',
  ...REGIONES_MUNICIPIOS.flatMap(r => r.municipios)
];

// Municipios principales para chips de acceso ultrarrápido
const CHIPS_DESTACADOS = ['Todos', 'Cercado', 'Quillacollo', 'Sacaba', 'Punata', 'Villa Tunari'];

export default function MapSection() {
  const [selectedMunicipio, setSelectedMunicipio] = useState('Todos');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [laboratorios, setLaboratorios] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el selector inteligente de municipios
  const [isMunOpen, setIsMunOpen] = useState(false);
  const [munSearch, setMunSearch] = useState('');
  const munDropdownRef = useRef(null);

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (munDropdownRef.current && !munDropdownRef.current.contains(event.target)) {
        setIsMunOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Función auxiliar para normalizar nombres de municipios al comparar
  const normalizeMun = (name) => {
    return (name || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  };

  // Filtrado combinado por municipio y especialidad (reconoce múltiples especialidades por laboratorio)
  const filteredLabs = laboratorios.filter(lab => {
    const matchMunicipio = selectedMunicipio === 'Todos' || normalizeMun(lab.municipio) === normalizeMun(selectedMunicipio);
    
    if (!matchMunicipio) return false;
    if (!selectedEspecialidad) return true;

    // Verificar si alguna de las especialidades del laboratorio coincide con la seleccionada en la leyenda
    const specialties = getLabSpecialties(lab);
    return specialties.some(esp => esp.id === selectedEspecialidad.id || esp.key === selectedEspecialidad.key);
  });

  // Conteo de laboratorios por municipio para enriquecer el selector
  const labCountByMun = laboratorios.reduce((acc, lab) => {
    const norm = normalizeMun(lab.municipio);
    if (norm) {
      acc[norm] = (acc[norm] || 0) + 1;
    }
    return acc;
  }, {});

  // Filtrado en vivo de regiones y municipios para el buscador inteligente
  const searchNorm = normalizeMun(munSearch);
  const regionesFiltradas = REGIONES_MUNICIPIOS.map(reg => {
    const matchingMuns = reg.municipios.filter(m => {
      if (!searchNorm) return true;
      return normalizeMun(m).includes(searchNorm) || normalizeMun(reg.region).includes(searchNorm);
    });
    return { ...reg, municipios: matchingMuns };
  }).filter(reg => reg.municipios.length > 0);

  const handleSelectMunicipio = (mun) => {
    setSelectedMunicipio(mun);
    setSelectedLab(null);
    setIsMunOpen(false);
    setMunSearch('');
  };

  const selectedCount = selectedMunicipio === 'Todos'
    ? laboratorios.length
    : (labCountByMun[normalizeMun(selectedMunicipio)] || 0);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mapa Georreferenciado de Laboratorios
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">
          Consulte la ubicación, nivel y horario de atención de los laboratorios habilitados en el departamento de Cochabamba.
        </p>
      </div>

      {/* Grid: Real Map + Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* Mapa Real Georreferenciado con Leaflet + OpenStreetMap */}
        <div className="lg:col-span-8 h-[380px] sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
          <RealMultiMapView
            laboratorios={filteredLabs}
            selectedLab={selectedLab}
            onSelectLab={(lab) => setSelectedLab(lab)}
            selectedMunicipio={selectedMunicipio}
            selectedEspecialidad={selectedEspecialidad}
            height="100%"
          />
        </div>

        {/* Sidebar Filters & Results Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 max-h-[480px] lg:max-h-[540px]">
          <div className="space-y-3 sm:space-y-3.5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Filtros Espaciales</h3>
              <p className="text-xs text-slate-500">Búsqueda inteligente por municipio y especialidad.</p>
            </div>

            {/* Chips de Acceso Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {CHIPS_DESTACADOS.map((chip) => {
                const isChipSelected = selectedMunicipio === chip;
                const count = chip === 'Todos' ? laboratorios.length : (labCountByMun[normalizeMun(chip)] || 0);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSelectMunicipio(chip)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      isChipSelected
                        ? 'bg-[#005596] text-white border-[#005596] shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span>{chip === 'Todos' ? '🌐 Todos' : chip}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      isChipSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selector Inteligente con Buscador y Regiones */}
            <div className="space-y-1.5 relative" ref={munDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  MUNICIPIO (47 OFICIALES)
                </label>
                {selectedMunicipio !== 'Todos' && (
                  <button
                    type="button"
                    onClick={() => handleSelectMunicipio('Todos')}
                    className="text-[10px] font-bold text-[#005596] hover:underline cursor-pointer"
                  >
                    Ver todo Cochabamba
                  </button>
                )}
              </div>

              {/* Botón Disparador del Menú */}
              <button
                type="button"
                onClick={() => setIsMunOpen(!isMunOpen)}
                className={`w-full bg-slate-50 hover:bg-slate-100/80 border text-slate-800 text-sm rounded-xl px-3.5 py-2.5 flex items-center justify-between transition cursor-pointer font-medium ${
                  isMunOpen ? 'ring-2 ring-[#0077be] border-[#0077be] bg-white' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MapPin className="w-4 h-4 text-[#005596] shrink-0" />
                  <span className="font-bold text-slate-900 truncate">
                    {selectedMunicipio === 'Todos' ? 'Todos los Municipios' : selectedMunicipio}
                  </span>
                  <span className="text-xs text-[#005596] bg-blue-50 font-bold px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                    {selectedCount} lab{selectedCount === 1 ? '' : 's'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMunOpen ? 'rotate-180 text-[#0077be]' : ''}`} />
              </button>

              {/* Menú Desplegable Flotante con Buscador */}
              {isMunOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-150">
                  {/* Barra de Búsqueda Integrada */}
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={munSearch}
                      onChange={(e) => setMunSearch(e.target.value)}
                      placeholder="Buscar municipio (ej: Quillacollo, Punata...)"
                      className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                      autoFocus
                    />
                    {munSearch && (
                      <button
                        type="button"
                        onClick={() => setMunSearch('')}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lista Scrollable por Regiones */}
                  <div className="overflow-y-auto p-2 space-y-3 flex-1">
                    {/* Opción Todos */}
                    {(!searchNorm || 'todos'.includes(searchNorm)) && (
                      <button
                        type="button"
                        onClick={() => handleSelectMunicipio('Todos')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedMunicipio === 'Todos'
                            ? 'bg-blue-50 text-[#005596] ring-1 ring-[#005596]/30 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>🌐</span>
                          <span>Todos los Municipios de Cochabamba</span>
                        </div>
                        <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-700">
                          {laboratorios.length}
                        </span>
                      </button>
                    )}

                    {regionesFiltradas.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No se encontró ningún municipio con "<strong>{munSearch}</strong>"
                      </div>
                    ) : (
                      regionesFiltradas.map((reg) => (
                        <div key={reg.region} className="space-y-1">
                          {/* Cabecera de Región */}
                          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase bg-slate-100/60 rounded-lg">
                            <span>{reg.icono}</span>
                            <span>{reg.region}</span>
                          </div>

                          {/* Municipios de la Región */}
                          <div className="grid grid-cols-1 gap-0.5 pt-0.5">
                            {reg.municipios.map((mun) => {
                              const isSelected = selectedMunicipio === mun;
                              const count = labCountByMun[normalizeMun(mun)] || 0;
                              return (
                                <button
                                  key={mun}
                                  type="button"
                                  onClick={() => handleSelectMunicipio(mun)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 text-[#005596] font-extrabold ring-1 ring-[#005596]/30'
                                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#005596] shrink-0" />}
                                    <span className={isSelected ? 'text-[#005596]' : ''}>{mun}</span>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                                    count > 0 
                                      ? 'bg-blue-100/80 text-[#005596]' 
                                      : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {count} {count === 1 ? 'lab' : 'labs'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
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
              <div className="text-center py-6 px-3 space-y-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 mx-auto bg-blue-50 text-[#005596] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    {selectedMunicipio !== 'Todos' 
                      ? `No hay laboratorios en ${selectedMunicipio}` 
                      : 'No se encontraron laboratorios'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {selectedMunicipio !== 'Todos'
                      ? 'Consulte los requisitos ante el SEDES Cochabamba para tramitar la apertura y habilitación de un laboratorio en este municipio.'
                      : 'Pruebe seleccionando otro filtro o municipio.'}
                  </p>
                </div>
                {selectedEspecialidad && (
                  <button
                    onClick={() => setSelectedEspecialidad(null)}
                    className="text-xs font-bold text-[#005596] hover:underline block mx-auto pt-1 cursor-pointer"
                  >
                    Ver todas las especialidades
                  </button>
                )}
              </div>
            ) : (
              filteredLabs.map((lab) => {
                const isSelected = selectedLab && selectedLab.id === lab.id;
                const specialties = getLabSpecialties(lab);
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

                    {/* Insignias de Especialidades y Horario */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {specialties.map((esp) => {
                          const isHighlighted = selectedEspecialidad && (selectedEspecialidad.id === esp.id || selectedEspecialidad.key === esp.key);
                          return (
                            <span 
                              key={esp.id}
                              className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                                isHighlighted ? 'ring-2 ring-offset-1 ring-[#0073c6]' : ''
                              }`}
                              style={{
                                backgroundColor: `${esp.colorHex}15`,
                                color: esp.colorHex,
                                borderColor: `${esp.colorHex}35`
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: esp.colorHex }}></span>
                              <span>{esp.shortName}</span>
                            </span>
                          );
                        })}
                      </div>

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
