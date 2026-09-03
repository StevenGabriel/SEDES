import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Sparkles, SlidersHorizontal, Sun, Moon } from 'lucide-react';

export default function HorarioPicker({ value = '', onChange = () => {} }) {
  // Analizar valor inicial o usar valores predeterminados
  const is24h = (value || '').toLowerCase().includes('24');
  const isLunSab = (value || '').toLowerCase().includes('lun-sáb') || (value || '').toLowerCase().includes('lun-sab');
  
  const [modo, setModo] = useState(
    is24h ? '24h' : isLunSab ? 'lunsab' : 'estandar'
  );

  // Estados para configuración personalizada
  const [lunVieActivo, setLunVieActivo] = useState(true);
  const [lunVieDesde, setLunVieDesde] = useState('07:00');
  const [lunVieHasta, setLunVieHasta] = useState('19:00');

  const [sabActivo, setSabActivo] = useState(true);
  const [sabDesde, setSabDesde] = useState('08:00');
  const [sabHasta, setSabHasta] = useState('13:00');

  const [domActivo, setDomActivo] = useState(false);
  const [domDesde, setDomDesde] = useState('08:00');
  const [domHasta, setDomHasta] = useState('12:00');

  // Función para construir la cadena oficial de horario
  const generarCadenaHorario = (nuevoModo = modo) => {
    if (nuevoModo === 'estandar') {
      return 'Lun-Vie 07:00 - 19:00, Sáb 08:00 - 13:00';
    }
    if (nuevoModo === '24h') {
      return 'Atención Continua 24 Horas (24/7)';
    }
    if (nuevoModo === 'lunsab') {
      return 'Lun-Sáb 07:00 - 19:00';
    }
    if (nuevoModo === 'personalizado') {
      const partes = [];
      if (lunVieActivo) {
        partes.push(`Lun-Vie ${lunVieDesde} - ${lunVieHasta}`);
      }
      if (sabActivo) {
        partes.push(`Sáb ${sabDesde} - ${sabHasta}`);
      }
      if (domActivo) {
        partes.push(`Dom ${domDesde} - ${domHasta}`);
      }
      return partes.length > 0 ? partes.join(', ') : 'Lun-Vie 07:00 - 19:00';
    }
    return 'Lun-Vie 07:00 - 19:00, Sáb 08:00 - 13:00';
  };

  const handleSeleccionarModo = (nuevoModo) => {
    setModo(nuevoModo);
    const cadena = generarCadenaHorario(nuevoModo);
    onChange(cadena);
  };

  // Reaccionar a cambios en los selectores personalizados
  useEffect(() => {
    if (modo === 'personalizado') {
      const cadena = generarCadenaHorario('personalizado');
      onChange(cadena);
    }
  }, [lunVieActivo, lunVieDesde, lunVieHasta, sabActivo, sabDesde, sabHasta, domActivo, domDesde, domHasta]);

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      
      {/* Botones de Presets Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        
        {/* Preset 1: Estándar SEDES */}
        <button
          type="button"
          onClick={() => handleSeleccionarModo('estandar')}
          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            modo === 'estandar'
              ? 'bg-blue-50/90 border-[#0073c6] text-[#005596] shadow-2xs ring-2 ring-[#0073c6]/30'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">Estándar SEDES</span>
            {modo === 'estandar' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0073c6]" />}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Lun-Vie 7-19h, Sáb 8-13h
          </span>
        </button>

        {/* Preset 2: 24 Horas */}
        <button
          type="button"
          onClick={() => handleSeleccionarModo('24h')}
          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            modo === '24h'
              ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-2xs ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">24 Horas (24/7)</span>
            {modo === '24h' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Atención Continua
          </span>
        </button>

        {/* Preset 3: Lun-Sáb Corrido */}
        <button
          type="button"
          onClick={() => handleSeleccionarModo('lunsab')}
          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            modo === 'lunsab'
              ? 'bg-blue-50/90 border-[#0073c6] text-[#005596] shadow-2xs ring-2 ring-[#0073c6]/30'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">Lun-Sáb Corrido</span>
            {modo === 'lunsab' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0073c6]" />}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            07:00 a 19:00
          </span>
        </button>

        {/* Preset 4: Personalizado */}
        <button
          type="button"
          onClick={() => handleSeleccionarModo('personalizado')}
          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
            modo === 'personalizado'
              ? 'bg-purple-50/90 border-purple-500 text-purple-900 shadow-2xs ring-2 ring-purple-500/30'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">Personalizado</span>
            {modo === 'personalizado' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Configurar por días
          </span>
        </button>
      </div>

      {/* Configurador Desplegable si es Personalizado */}
      {modo === 'personalizado' && (
        <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Configurar Horarios por Días
            </span>
            <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
              Ajuste Preciso
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            
            {/* Lunes a Viernes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lunVieActivo}
                  onChange={(e) => setLunVieActivo(e.target.checked)}
                  className="rounded text-[#0073c6] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Lunes a Viernes</span>
              </label>

              {lunVieActivo ? (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-medium">De</span>
                  <input
                    type="time"
                    value={lunVieDesde}
                    onChange={(e) => setLunVieDesde(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0073c6]"
                  />
                  <span className="text-slate-400 font-medium">a</span>
                  <input
                    type="time"
                    value={lunVieHasta}
                    onChange={(e) => setLunVieHasta(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0073c6]"
                  />
                </div>
              ) : (
                <span className="text-rose-600 font-bold text-[11px]">Cerrado</span>
              )}
            </div>

            {/* Sábado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sabActivo}
                  onChange={(e) => setSabActivo(e.target.checked)}
                  className="rounded text-[#0073c6] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Sábados</span>
              </label>

              {sabActivo ? (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-medium">De</span>
                  <input
                    type="time"
                    value={sabDesde}
                    onChange={(e) => setSabDesde(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0073c6]"
                  />
                  <span className="text-slate-400 font-medium">a</span>
                  <input
                    type="time"
                    value={sabHasta}
                    onChange={(e) => setSabHasta(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0073c6]"
                  />
                </div>
              ) : (
                <span className="text-rose-600 font-bold text-[11px]">Cerrado</span>
              )}
            </div>

            {/* Domingo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={domActivo}
                  onChange={(e) => setDomActivo(e.target.checked)}
                  className="rounded text-[#0073c6] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Domingos / Feriados</span>
              </label>

              {domActivo ? (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-medium">De</span>
                  <input
                    type="time"
                    value={domDesde}
                    onChange={(e) => setDomDesde(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0073c6]"
                  />
                  <span className="text-slate-400 font-medium">a</span>
                  <input
                    type="time"
                    value={domHasta}
                    onChange={(e) => setDomHasta(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0073c6]"
                  />
                </div>
              ) : (
                <span className="text-rose-600 font-bold text-[11px]">Cerrado</span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Previsualización del Horario Oficial Generado */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-[#0073c6]" />
          <span className="text-slate-400 font-medium">Horario Oficial Generado:</span>
          <span className="font-bold text-slate-800">{value || generarCadenaHorario()}</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ✓ Formato Válido
        </span>
      </div>

    </div>
  );
}
