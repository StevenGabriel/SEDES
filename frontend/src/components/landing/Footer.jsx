import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0077be] text-white pt-12 pb-6 border-t border-cyan-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold tracking-tight text-white">
              SEDES Cochabamba
            </h3>
            <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-sm">
              Servicio Departamental de Salud de Cochabamba, responsable de regular, 
              fiscalizar y autorizar los servicios sanitarios públicos y privados.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              TRÁMITES COMUNES
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-cyan-100/90">
              <li>
                <a href="#licencia" className="hover:text-white transition hover:underline">
                  Licencia de Apertura
                </a>
              </li>
              <li>
                <a href="#renovacion" className="hover:text-white transition hover:underline">
                  Renovación de Funcionamiento
                </a>
              </li>
              <li>
                <a href="#acreditacion" className="hover:text-white transition hover:underline">
                  Acreditación Profesional
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              CONTACTO
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-cyan-100/90">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Calle Aniceto Arce #284</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Telf: +591 (4) 4252541</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-300 shrink-0" />
                <a href="mailto:soporte@sedescbba.gob.bo" className="hover:text-white hover:underline">
                  soporte@sedescbba.gob.bo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-cyan-600/50 flex flex-col sm:flex-row items-center justify-between text-xs text-cyan-100/80 gap-3">
          <p>© 2026 SEDES Cochabamba. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-4">
            <a href="#terminos" className="hover:text-white transition hover:underline">
              Términos de Uso
            </a>
            <span>|</span>
            <a href="#privacidad" className="hover:text-white transition hover:underline">
              Políticas de Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
