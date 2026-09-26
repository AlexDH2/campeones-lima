import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export default function NotificacionPromo() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-[9999] select-none animate-in fade-in slide-in-from-bottom-3 duration-300 flex justify-center sm:block">
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 px-4 py-3 sm:py-2.5 rounded-2xl sm:rounded-full bg-[#071527]/95 backdrop-blur-md border-2 border-[#F7B52C] shadow-[0_8px_30px_rgba(247,181,44,0.3)] hover:border-[#00B4A7] transition-all group w-full sm:w-auto">
        
        {/* Icono con pulso y texto */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 rounded-full bg-[#F7B52C] animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#F7B52C] shrink-0" />
            <span className="truncate">Promos en Sedes</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Separador */}
          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Botón de enlace */}
          <Link
            to="/sedes"
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#00B4A7] group-hover:text-white transition-colors cursor-pointer"
          >
            <span>Ver</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="ml-1 p-1 sm:p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer bg-slate-800/50 sm:bg-transparent"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}