import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export default function NotificacionPromo() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#071527]/95 backdrop-blur-md border-2 border-[#F7B52C] shadow-[0_8px_30px_rgba(247,181,44,0.3)] hover:border-[#00B4A7] transition-all group">
        
        {/* Icono con pulso */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#F7B52C] animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F7B52C]" />
            <span>Promociones en nuestras sedes</span>
          </span>
        </div>

        {/* Separador */}
        <span className="text-slate-600">|</span>

        {/* Botón de enlace */}
        <Link
          to="/sedes"
          className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#00B4A7] group-hover:text-white transition-colors cursor-pointer"
        >
          <span>Conocer</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}