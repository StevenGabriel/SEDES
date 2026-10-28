import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, Send, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function FloatingSupportButtons() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatWindowRef = useRef(null);

  // Cerrar ventana flotante al presionar ESC o al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        // No cerrar si el clic fue en el botón del bot
        const botBtn = document.getElementById('btn-floating-bot');
        if (botBtn && botBtn.contains(event.target)) return;
        setIsChatOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsChatOpen(false);
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen]);

  const whatsappUrl = "https://wa.me/59179397955?text=Hola%20SEDES%20Cochabamba%2C%20quisiera%20realizar%20una%20consulta%20sobre%20laboratorios%20cl%C3%ADnicos.";

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end space-y-3 pointer-events-none">
      
      {/* 1. Ventanita del ChatBot ("Próximamente") */}
      {isChatOpen && (
        <div 
          ref={chatWindowRef}
          className="pointer-events-auto w-[calc(100vw-2.5rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-title"
        >
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-[#005596] via-[#0066aa] to-[#0077c8] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-cyan-200" />
                </div>
                {/* Indicador de estado */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
                </span>
              </div>

              <div>
                <h3 id="chatbot-title" className="text-sm font-bold flex items-center space-x-1.5 leading-tight">
                  <span>Asistente Virtual SI_Lab</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                </h3>
                <p className="text-[11px] text-cyan-100/90 font-medium flex items-center space-x-1">
                  <span>SEDES Cochabamba</span>
                  <span>•</span>
                  <span className="text-amber-200 font-semibold">En desarrollo</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 active:bg-white/30 text-white/90 hover:text-white transition cursor-pointer"
              aria-label="Cerrar chat"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo del Chat / Mensaje Próximamente */}
          <div className="p-5 space-y-4 bg-slate-50/60 max-h-[420px] overflow-y-auto">
            
            {/* Badge de anuncio */}
            <div className="flex justify-center">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Módulo en fase de desarrollo</span>
              </span>
            </div>

            {/* Tarjeta central "Próximamente" */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#005596]/10 to-cyan-500/10 border border-[#005596]/20 flex items-center justify-center text-[#005596]">
                <Bot className="w-8 h-8 text-[#0077c8]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-800 tracking-tight">
                  ¡Próximamente disponible!
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Estamos integrando un Asistente de Inteligencia Artificial para responder consultas 24/7 sobre requisitos de apertura, estado de trámites y normativa departamental de laboratorios.
                </p>
              </div>

              {/* Simulación de chat interactivo */}
              <div className="space-y-2 pt-2 text-left">
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-700 border border-slate-200/60">
                  <p className="font-semibold text-slate-800 text-[11px] mb-0.5">💬 Consulta ciudadana:</p>
                  "¿Qué documentos necesito para habilitar un laboratorio Nivel 1?"
                </div>
                <div className="bg-[#005596]/10 rounded-2xl rounded-tr-sm p-3 text-xs text-[#00447a] border border-[#005596]/20">
                  <p className="font-bold text-[#005596] text-[11px] flex items-center space-x-1 mb-0.5">
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    <span>Respuesta IA SI_Lab:</span>
                  </p>
                  "Muy pronto podré responder tus dudas al instante con base en la normativa sanitaria oficial del SEDES."
                </div>
              </div>
            </div>

            {/* Alternativa inmediata: WhatsApp */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
              <div className="p-1.5 bg-emerald-500 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-bold text-emerald-950">
                  ¿Necesitas atención en este momento?
                </p>
                <p className="text-emerald-800 leading-tight text-[11px]">
                  Puedes escribir directamente a nuestro canal de soporte institucional por WhatsApp.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-0.5"
                >
                  <span>Abrir WhatsApp (+591 79397955)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* Footer del Chat con Input Mock deshabilitado */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <div className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed select-none border border-slate-200/80">
              Escribe un mensaje... (Próximamente)
            </div>
            <button
              disabled
              className="p-2.5 rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed"
              title="Envío no disponible temporalmente"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Botones Flotantes de Acción */}
      <div className="pointer-events-auto flex flex-col items-end space-y-3">
        
        {/* Botón WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-600/40 transition-all duration-200 cursor-pointer"
          aria-label="Contactar por WhatsApp (+591 79397955)"
        >
          {/* Tooltip a la izquierda */}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md backdrop-blur-xs flex items-center space-x-1.5">
            <span>WhatsApp (+591 79397955)</span>
          </span>

          {/* Icono Oficial WhatsApp */}
          <svg 
            className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.97.54 1.761.815 2.796.815 3.183 0 5.77-2.587 5.77-5.768.001-3.18-2.586-5.767-5.77-5.767zm3.367 8.163c-.141.399-.817.77-1.124.819-.307.049-.699.071-1.127-.066-.345-.11-.791-.259-1.408-.528-2.617-1.144-4.316-3.8-4.448-3.974-.132-.174-1.066-1.417-1.066-2.703 0-1.286.674-1.921.914-2.176.241-.256.525-.32.7-.32.176 0 .351.002.505.01.162.008.38-.061.593.451.222.535.759 1.85.826 1.986.067.136.111.298.02.477-.091.179-.136.291-.271.451-.135.16-.284.358-.406.48-.135.136-.277.284-.12.553.157.269.697 1.15 1.493 1.86 1.026.914 1.892 1.198 2.162 1.334.269.136.427.114.586-.068.158-.182.679-.792.86-1.063.18-.271.362-.227.608-.136.247.091 1.564.737 1.833.872.269.135.449.203.516.316.068.113.068.654-.073 1.053z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.176L2 22l4.981-1.306C8.423 21.528 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.176-.46-4.502-1.258l-.323-.193-2.966.778.792-2.893-.212-.338C3.916 15.011 3.438 13.543 3.438 12c0-4.721 3.841-8.562 8.562-8.562 4.72 0 8.562 3.841 8.562 8.562 0 4.721-3.842 8.25-8.562 8.25z" />
          </svg>
        </a>

        {/* Botón ChatBot (Próximamente) */}
        <button
          id="btn-floating-bot"
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full transition-all duration-200 cursor-pointer shadow-xl hover:shadow-2xl ${
            isChatOpen 
              ? 'bg-slate-800 text-white rotate-90 scale-95 shadow-slate-900/40' 
              : 'bg-gradient-to-r from-[#005596] via-[#006bb3] to-[#0088cc] hover:from-[#004b85] hover:to-[#0077b8] text-white hover:shadow-cyan-900/40 active:scale-95'
          }`}
          aria-label={isChatOpen ? "Cerrar asistente" : "Abrir asistente virtual"}
          title={isChatOpen ? "Cerrar asistente" : "Asistente Virtual (Próximamente)"}
        >
          {/* Tooltip a la izquierda */}
          {!isChatOpen && (
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md backdrop-blur-xs flex items-center space-x-1.5">
              <span>Asistente Virtual (Próximamente)</span>
            </span>
          )}

          {isChatOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <>
              <Bot className="w-7 h-7 sm:w-7.5 sm:h-7.5 transition-transform group-hover:scale-110" />
              {/* Badge indicativo de "IA" */}
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] shadow-sm uppercase tracking-wider">
                IA
              </span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}
