import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, FlaskConical, MapPin, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import logoL1 from '../../assets/L1.png';
import logoL2 from '../../assets/L2.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [estaBuscando, setEstaBuscando] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [todosLaboratorios, setTodosLaboratorios] = useState([]);
  const [buscadorMovilAbierto, setBuscadorMovilAbierto] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar catálogo de laboratorios desde el Backend para búsqueda instantánea
  useEffect(() => {
    const cargarLaboratorios = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/establecimientos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTodosLaboratorios(data);
          }
        }
      } catch (err) {
        console.warn('Error al precargar laboratorios para el buscador:', err);
      }
    };
    cargarLaboratorios();
  }, []);

  // Filtrar en tiempo real por nombre comercial, municipio o código CUE
  useEffect(() => {
    const q = terminoBusqueda.trim().toLowerCase();
    if (!q) {
      setResultados([]);
      setDropdownAbierto(false);
      return;
    }

    setEstaBuscando(true);
    const timer = setTimeout(() => {
      const filtrados = todosLaboratorios.filter(lab => {
        const nombre = (lab.nombre_comercial || '').toLowerCase();
        const cue = (lab.codigo_cue || '').toLowerCase();
        const mun = (lab.municipio || '').toLowerCase();
        const dir = (lab.direccion || '').toLowerCase();
        return nombre.includes(q) || cue.includes(q) || mun.includes(q) || dir.includes(q);
      });

      setResultados(filtrados.slice(0, 6)); // Top 6 coincidencias
      setDropdownAbierto(true);
      setEstaBuscando(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [terminoBusqueda, todosLaboratorios]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickAfuera = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  // Navegar al detalle del laboratorio seleccionado
  const handleSeleccionarLab = (lab) => {
    const idParam = lab.codigo_cue && lab.codigo_cue !== 'Nuevo' ? lab.codigo_cue : lab.id;
    setDropdownAbierto(false);
    setTerminoBusqueda('');
    setBuscadorMovilAbierto(false);
    navigate(`/laboratorio/${encodeURIComponent(idParam)}`);
  };

  return (
    <header className="bg-gradient-to-r from-[#005596] via-[#0077be] to-[#0099e6] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Lado Izquierdo: SI_Lab y Escudo L1 */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer group" title="Inicio">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white">
              SI<span className="text-cyan-200">_Lab</span>
            </span>
          </Link>

          {/* Escudo L1 */}
          <div className="hidden xs:flex items-center pl-1 sm:pl-2">
            <img 
              src={logoL1} 
              alt="Escudo Institucional SEDES" 
              className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm" 
              title="Escudo Institucional SEDES"
            />
          </div>
        </div>

        {/* Centro: Barra de Búsqueda Interactiva (Desktop y Tablets) */}
        <div ref={dropdownRef} className="hidden sm:block flex-1 max-w-md md:max-w-xl mx-2 sm:mx-4 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 absolute left-3.5 text-white/80 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              onFocus={() => terminoBusqueda.trim() && setDropdownAbierto(true)}
              placeholder="Buscar laboratorio por nombre, CUE o municipio..."
              className="w-full bg-white/20 hover:bg-white/25 focus:bg-white/30 text-white placeholder-white/75 text-xs sm:text-sm rounded-xl pl-9 sm:pl-10 pr-9 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all border border-white/30 backdrop-blur-sm font-medium"
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={() => {
                  setTerminoBusqueda('');
                  setDropdownAbierto(false);
                }}
                className="absolute right-3 text-white/70 hover:text-white p-0.5 rounded cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown de Resultados en Vivo */}
          {dropdownAbierto && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                  Resultados Oficiales SEDES
                </span>
                {estaBuscando ? (
                  <span className="flex items-center space-x-1 text-[#0077c8] font-bold text-[11px]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Buscando...</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-semibold text-[11px]">
                    {resultados.length} {resultados.length === 1 ? 'encontrado' : 'encontrados'}
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {resultados.length === 0 && !estaBuscando ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <FlaskConical className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-bold text-slate-600">No se encontraron laboratorios</p>
                    <p className="text-[11px] text-slate-400">Intente buscar con otro nombre, sigla o municipio</p>
                  </div>
                ) : (
                  resultados.map((lab) => (
                    <div
                      key={lab.id}
                      onClick={() => handleSeleccionarLab(lab)}
                      className="p-3.5 hover:bg-sky-50/70 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-start space-x-3 pr-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#005596] to-[#008fe6] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-[#0077c8] transition truncate">
                            {lab.nombre_comercial}
                          </h4>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{lab.municipio || 'Cercado'}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-cyan-700 font-bold">CUE: {lab.codigo_cue || '3L0267'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-[#0077c8] border border-sky-100">
                          {lab.nivel || 'Nivel 1'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0077c8] group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

        {/* Lado Derecho: Buscador Toggle Móvil + Logo L2 y Botón Iniciar Sesión */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          
          {/* Botón de búsqueda para móviles */}
          <button
            type="button"
            onClick={() => setBuscadorMovilAbierto(!buscadorMovilAbierto)}
            className="sm:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer transition"
            title="Buscar Laboratorios"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Logo Cochabamba L2 */}
          <div className="hidden lg:flex items-center">
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
            className="bg-white hover:bg-slate-100 text-[#005596] font-bold text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer whitespace-nowrap"
          >
            <span className="sm:hidden">Ingresar</span>
            <span className="hidden sm:inline">Iniciar Sesión / Registrarse</span>
          </Link>
        </div>

      </div>

      {/* Barra de Búsqueda Desplegable en Móviles */}
      {buscadorMovilAbierto && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-white/20 animate-in slide-in-from-top-1 duration-150">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-white/80 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar laboratorio por nombre..."
              className="w-full bg-white/25 text-white placeholder-white/75 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30"
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={() => setTerminoBusqueda('')}
                className="absolute right-2.5 text-white/80 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Resultados en Móviles */}
          {terminoBusqueda.trim() && (
            <div className="mt-2 bg-white rounded-xl shadow-xl text-slate-800 divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {resultados.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No se encontraron laboratorios
                </div>
              ) : (
                resultados.map((lab) => (
                  <div
                    key={lab.id}
                    onClick={() => handleSeleccionarLab(lab)}
                    className="p-3 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-xs text-slate-900 truncate">{lab.nombre_comercial}</p>
                      <p className="text-[10px] text-slate-400 truncate">{lab.municipio} • CUE: {lab.codigo_cue || lab.id}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0077c8] shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
