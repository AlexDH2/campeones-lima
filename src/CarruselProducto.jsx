import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function CarruselProducto({ producto }) {
  const [indice, setIndice] = useState(0);

  // Compatibilidad: usar `fotos` array o fallback a `foto`
  let listaFotos = [];
  if (Array.isArray(producto.fotos) && producto.fotos.length > 0) {
    listaFotos = producto.fotos;
  } else if (producto.foto) {
    listaFotos = [producto.foto];
  }

  // Si no hay fotos, mostramos un placeholder
  if (listaFotos.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 font-bold bg-slate-900">
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        Sin foto
      </div>
    );
  }

  const normalizarCoordenada = (val, defecto = 50) => {
    if (val === null || val === undefined || val === '') return defecto;
    const num = Number(val);
    return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
  };

  const posX = normalizarCoordenada(producto.posicionX);
  const posY = normalizarCoordenada(producto.posicionY);

  const anterior = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndice((prev) => (prev - 1 + listaFotos.length) % listaFotos.length);
  };

  const siguiente = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndice((prev) => (prev + 1) % listaFotos.length);
  };

  return (
    <div className="relative w-full h-full group/carrusel bg-slate-950">
      <img
        loading="lazy"
        src={listaFotos[indice]}
        alt={producto.nombre}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/carrusel:scale-105"
        style={{ objectPosition: `${posX}% ${posY}%` }}
      />
      
      {listaFotos.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#00B4A7] text-white rounded-full p-1.5 opacity-0 group-hover/carrusel:opacity-100 transition-all z-10 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={siguiente}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#00B4A7] text-white rounded-full p-1.5 opacity-0 group-hover/carrusel:opacity-100 transition-all z-10 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {listaFotos.map((_, i) => (
              <div
                key={i}
                className={`transition-all rounded-full ${
                  i === indice ? 'w-4 h-1.5 bg-[#00B4A7]' : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
