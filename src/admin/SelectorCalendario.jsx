import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function SelectorCalendario({ fechaSeleccionada = '', alSeleccionar }) {
  const fechaBase = fechaSeleccionada ? new Date(fechaSeleccionada + 'T00:00:00') : new Date();
  
  const [añoActual, setAñoActual] = useState(fechaBase.getFullYear());
  const [mesActual, setMesActual] = useState(fechaBase.getMonth());

  const primerDiaMes = new Date(añoActual, mesActual, 1).getDay();
  const totalDiasMes = new Date(añoActual, mesActual + 1, 0).getDate();

  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAñoActual(prev => prev - 1);
    } else {
      setMesActual(prev => prev - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAñoActual(prev => prev + 1);
    } else {
      setMesActual(prev => prev + 1);
    }
  };

  const seleccionarDia = (dia) => {
    const dStr = String(dia).padStart(2, '0');
    const mStr = String(mesActual + 1).padStart(2, '0');
    const fechaIso = `${añoActual}-${mStr}-${dStr}`;
    alSeleccionar(fechaIso);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-[#F7B52C]" /> Calendario de Fechas:
        </span>
        {fechaSeleccionada && (
          <span className="text-[#00B4A7] font-mono text-[11px] bg-[#00B4A7]/10 px-2.5 py-0.5 rounded-full border border-[#00B4A7]/30">
            ✓ {fechaSeleccionada}
          </span>
        )}
      </div>

      <div className="p-4 bg-[#040914] rounded-2xl border border-slate-800 space-y-3">
        
        {/* CABECERA DEL MES Y NAVEGACIÓN */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <button 
            type="button" 
            onClick={mesAnterior} 
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-black text-white uppercase tracking-wider">
            {MESES[mesActual]} {añoActual}
          </span>

          <button 
            type="button" 
            onClick={mesSiguiente} 
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CABECERA DE DÍAS DE LA SEMANA */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
          {DIAS_SEMANA.map((d, i) => <div key={i}>{d}</div>)}
        </div>

        {/* CUADRÍCULA DE DÍAS DEL MES */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {Array.from({ length: primerDiaMes }).map((_, i) => (
            <div key={`vacio-${i}`} className="h-8" />
          ))}

          {Array.from({ length: totalDiasMes }).map((_, i) => {
            const dia = i + 1;
            const dStr = String(dia).padStart(2, '0');
            const mStr = String(mesActual + 1).padStart(2, '0');
            const fechaString = `${añoActual}-${mStr}-${dStr}`;
            const esSeleccionado = fechaSeleccionada === fechaString;

            return (
              <button
                type="button"
                key={dia}
                onClick={() => seleccionarDia(dia)}
                className={`h-8 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer ${
                  esSeleccionado 
                    ? 'bg-[#00B4A7] text-slate-950 font-black shadow-md shadow-[#00B4A7]/30 scale-105' 
                    : 'text-slate-300 hover:bg-[#071527] hover:text-white'
                }`}
              >
                {dia}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}