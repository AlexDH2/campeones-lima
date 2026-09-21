import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import ModalFrame from '../ModalFrame';

/**
 * ModalConfirmacion — Reemplaza confirm() y prompt() nativos del navegador.
 *
 * Props:
 *   abierto       — boolean, controla la visibilidad
 *   mensaje       — string, texto principal
 *   textoConfirmar — string, label del botón de confirmar (default: "Confirmar")
 *   textoCancelar  — string, label del botón de cancelar (default: "Cancelar")
 *   onConfirmar    — function(valorInput?), callback al confirmar
 *   onCancelar     — function, callback al cancelar
 *   peligroso      — boolean, si es true el botón confirmar se pinta de rojo
 *   conInput       — boolean, si es true muestra un campo de texto (reemplaza prompt)
 *   valorInicial   — string, valor inicial del input cuando conInput=true
 *   placeholderInput — string, placeholder del input
 */
export default function ModalConfirmacion({
  abierto,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
  peligroso = false,
  conInput = false,
  valorInicial = '',
  placeholderInput = ''
}) {
  const [valorInput, setValorInput] = useState(valorInicial);
  const inputRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      setValorInput(valorInicial);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [abierto, valorInicial]);

  if (!abierto) return null;

  const handleConfirmar = () => {
    onConfirmar?.(conInput ? valorInput : undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmar();
    }
  };

  return (
    <ModalFrame onClose={onCancelar} label="Confirmación" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#071527] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4 space-y-4 animate-in zoom-in-95 duration-200">

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${peligroso ? 'bg-red-500/15' : 'bg-[#00B4A7]/15'}`}>
              <AlertTriangle className={`w-5 h-5 ${peligroso ? 'text-red-400' : 'text-[#00B4A7]'}`} />
            </div>
            <p className="text-sm text-slate-200 font-semibold leading-relaxed pt-1.5">{mensaje}</p>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input opcional (reemplaza prompt) */}
        {conInput && (
          <input
            ref={inputRef}
            type="text"
            value={valorInput}
            onChange={e => setValorInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderInput}
            className="w-full bg-[#040914] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#00B4A7] focus:outline-none transition-colors"
          />
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
              peligroso
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25'
                : 'bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 shadow-[#00B4A7]/25'
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
