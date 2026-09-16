import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

import { ToastContext } from './toast';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const mostrarToast = (mensaje, tipo = 'exito') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all animate-in slide-in-from-bottom-5 ${
              t.tipo === 'exito'
                ? 'bg-[#071527] border-[#00B4A7] text-white shadow-[#00B4A7]/20'
                : 'bg-[#071527] border-red-500 text-red-300 shadow-red-500/20'
            }`}
          >
            {t.tipo === 'exito' ? (
              <CheckCircle2 className="w-4 h-4 text-[#00B4A7] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{t.mensaje}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

