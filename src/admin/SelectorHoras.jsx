/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export default function SelectorHoras({ valor = '', alCambiar }) {
  const [inicioH, setInicioH] = useState("00");
  const [inicioM, setInicioM] = useState("00");
  const [inicioP, setInicioP] = useState("PM");

  const [finH, setFinH] = useState("00");
  const [finM, setFinM] = useState("00");
  const [finP, setFinP] = useState("PM");

  useEffect(() => {
    if (!valor || typeof valor !== 'string' || !valor.includes('-')) return;

    try {
      const [primeraParte = '', segundaParte = ''] = valor.split('-');
      const parteInicio = String(primeraParte).trim();
      const parteFin = String(segundaParte).trim();

      if (!parteInicio || !parteFin) return;

      const esInicioAm = parteInicio.toUpperCase().includes('AM');
      const esFinAm = parteFin.toUpperCase().includes('AM');

      const [hIni = '', mIni = ''] = parteInicio.replace(/AM|PM/gi, '').trim().split(':');
      const [hFin = '', mFin = ''] = parteFin.replace(/AM|PM/gi, '').trim().split(':');

      if (hIni) {
        const num = parseInt(hIni, 10);
        setInicioH(num > 0 && num <= 12 ? String(num).padStart(2, '0') : "12");
      }
      if (mIni) {
        const num = parseInt(mIni, 10);
        setInicioM(num >= 0 && num <= 59 ? String(num).padStart(2, '0') : "00");
      }
      setInicioP(esInicioAm ? 'AM' : 'PM');

      if (hFin) {
        const num = parseInt(hFin, 10);
        setFinH(num > 0 && num <= 12 ? String(num).padStart(2, '0') : "12");
      }
      if (mFin) {
        const num = parseInt(mFin, 10);
        setFinM(num >= 0 && num <= 59 ? String(num).padStart(2, '0') : "00");
      }
      setFinP(esFinAm ? 'AM' : 'PM');
    } catch {
      console.warn("No se pudo parsear el horario:", valor);
    }
  }, [valor]);

  const procesarNumero = (val, maximo) => {
    const digitos = val.replace(/\D/g, '');
    if (!digitos || digitos === '0' || digitos === '00') return '00';
    const ultimosDos = digitos.length > 2 ? digitos.slice(-2) : digitos;
    let num = parseInt(ultimosDos, 10);
    if (isNaN(num)) return '00';
    if (num > maximo) num = maximo;
    return String(num).padStart(2, '0');
  };

  const actualizar = (iH, iM, iP, fH, fM, fP) => {
    const h1 = iH && iH !== '00' ? String(parseInt(iH, 10)) : '12';
    const m1 = iM ? String(iM).padStart(2, '0') : '00';
    const p1 = iP === 'AM' ? 'AM' : 'PM';

    const h2 = fH && fH !== '00' ? String(parseInt(fH, 10)) : '12';
    const m2 = fM ? String(fM).padStart(2, '0') : '00';
    const p2 = fP === 'AM' ? 'AM' : 'PM';

    if (typeof alCambiar === 'function') {
      alCambiar(`${h1}:${m1} ${p1} - ${h2}:${m2} ${p2}`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
        <Clock className="w-4 h-4 text-[#00B4A7]" />
        <span>Rango de Horas (Escribe los números directamente):</span>
      </div>

      <div className="p-3 w-full max-w-xl min-h-[85px] bg-[#040914] rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* HORA DE INICIO */}
        <div className="flex items-center gap-2 bg-[#071527] p-2.5 rounded-xl border border-slate-700/80 w-full sm:w-auto justify-center sm:justify-start">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Inicio:</span>
          
          <input
            type="text"
            inputMode="numeric"
            value={inicioH}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.target.select()}
            onChange={(e) => {
              const res = procesarNumero(e.target.value, 12);
              setInicioH(res);
              actualizar(res, inicioM, inicioP, finH, finM, finP);
            }}
            onBlur={() => {
              if (inicioH === '00' || !inicioH) {
                setInicioH('12');
                actualizar('12', inicioM, inicioP, finH, finM, finP);
              }
            }}
            className="w-11 bg-[#040914] text-white font-mono font-black text-center p-1.5 rounded-lg border border-slate-800 focus:border-[#00B4A7] focus:outline-none"
            title="Horas (01 - 12)"
          />

          <span className="text-white font-bold">:</span>

          <input
            type="text"
            inputMode="numeric"
            value={inicioM}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.target.select()}
            onChange={(e) => {
              const res = procesarNumero(e.target.value, 59);
              setInicioM(res);
              actualizar(inicioH, res, inicioP, finH, finM, finP);
            }}
            className="w-11 bg-[#040914] text-white font-mono font-black text-center p-1.5 rounded-lg border border-slate-800 focus:border-[#00B4A7] focus:outline-none"
            title="Minutos (00 - 59)"
          />

          <button
            type="button"
            onClick={() => {
              const nuevoP = inicioP === 'AM' ? 'PM' : 'AM';
              setInicioP(nuevoP);
              actualizar(inicioH, inicioM, nuevoP, finH, finM, finP);
            }}
            className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-all ml-1 shadow"
            title="Alternar AM / PM"
          >
            {inicioP}
          </button>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />

        {/* HORA DE FIN */}
        <div className="flex items-center gap-2 bg-[#071527] p-2.5 rounded-xl border border-slate-700/80 w-full sm:w-auto justify-center sm:justify-start">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Fin:</span>
          
          <input
            type="text"
            inputMode="numeric"
            value={finH}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.target.select()}
            onChange={(e) => {
              const res = procesarNumero(e.target.value, 12);
              setFinH(res);
              actualizar(inicioH, inicioM, inicioP, res, finM, finP);
            }}
            onBlur={() => {
              if (finH === '00' || !finH) {
                setFinH('12');
                actualizar(inicioH, inicioM, inicioP, '12', finM, finP);
              }
            }}
            className="w-11 bg-[#040914] text-white font-mono font-black text-center p-1.5 rounded-lg border border-slate-800 focus:border-[#F7B52C] focus:outline-none"
            title="Horas (01 - 12)"
          />

          <span className="text-white font-bold">:</span>

          <input
            type="text"
            inputMode="numeric"
            value={finM}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.target.select()}
            onChange={(e) => {
              const res = procesarNumero(e.target.value, 59);
              setFinM(res);
              actualizar(inicioH, inicioM, inicioP, finH, res, finP);
            }}
            className="w-11 bg-[#040914] text-white font-mono font-black text-center p-1.5 rounded-lg border border-slate-800 focus:border-[#F7B52C] focus:outline-none"
            title="Minutos (00 - 59)"
          />

          <button
            type="button"
            onClick={() => {
              const nuevoP = finP === 'AM' ? 'PM' : 'AM';
              setFinP(nuevoP);
              actualizar(inicioH, inicioM, inicioP, finH, finM, nuevoP);
            }}
            className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-all ml-1 shadow"
            title="Alternar AM / PM"
          >
            {finP}
          </button>
        </div>

      </div>
    </div>
  );
}