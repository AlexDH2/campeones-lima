import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Crop, 
  RotateCcw, 
  Hand, 
  Plus, 
  Minus,
  Move,
  Upload,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../supabase';

export default function ModalEncuadre(props) {
  const estaAbierto = props.abierto ?? props.isOpen ?? props.show ?? false;

  const urlDetectada = props.imagenUrl || 
                        props.imagen || 
                        props.foto || 
                        props.url || 
                        props.image || 
                        props.src || 
                        props.fotoUrl || 
                        props.banner || 
                        props.foto_principal || 
                        (props.item && (props.item.url || props.item.foto || props.item.imagen)) || 
                        "";

  const posInicialY = Number(props.posicionInicial ?? props.posicionY ?? props.posicion ?? props.pos ?? 50);
  const posInicialX = Number(props.posicionInicialX ?? props.posicionX ?? props.posX ?? 50);

  const fnCerrar = props.alCerrar || props.onClose || (() => {});
  const fnGuardar = props.alGuardar || props.onSave || props.onGuardar || (() => {});

  // Estados
  const [urlImagenActual, setUrlImagenActual] = useState(urlDetectada);
  const [posicionY, setPosicionY] = useState(posInicialY);
  const [posicionX, setPosicionX] = useState(posInicialX);
  const [zoom, setZoom] = useState(1.2);
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendoNuevaFoto, setSubiendoNuevaFoto] = useState(false);

  // Referencias para arrastre 360° fluido
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startPosXRef = useRef(posInicialX);
  const startPosYRef = useRef(posInicialY);

  const firmaEntrada = JSON.stringify([posInicialY, posInicialX, estaAbierto, urlDetectada]);
  const [ultimaEntrada, setUltimaEntrada] = useState(firmaEntrada);
  if (ultimaEntrada !== firmaEntrada) {
    setUltimaEntrada(firmaEntrada);
    setUrlImagenActual(urlDetectada);
    setPosicionY(posInicialY);
    setPosicionX(posInicialX);
    setZoom(1.2);
  }

  // EVENTOS GLOBALES DE ARRASTRE
  useEffect(() => {
    if (!estaAbierto) return;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      let nuevaPosX = startPosXRef.current - (deltaX * 0.4);
      nuevaPosX = Math.max(0, Math.min(100, Math.round(nuevaPosX)));
      setPosicionX(nuevaPosX);

      let nuevaPosY = startPosYRef.current - (deltaY * 0.4);
      nuevaPosY = Math.max(0, Math.min(100, Math.round(nuevaPosY)));
      setPosicionY(nuevaPosY);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setArrastrando(false);
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      const deltaX = e.touches[0].clientX - startXRef.current;
      const deltaY = e.touches[0].clientY - startYRef.current;

      let nuevaPosX = startPosXRef.current - (deltaX * 0.4);
      nuevaPosX = Math.max(0, Math.min(100, Math.round(nuevaPosX)));
      setPosicionX(nuevaPosX);

      let nuevaPosY = startPosYRef.current - (deltaY * 0.4);
      nuevaPosY = Math.max(0, Math.min(100, Math.round(nuevaPosY)));
      setPosicionY(nuevaPosY);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      setArrastrando(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [estaAbierto]);

  if (!estaAbierto) return null;

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startPosXRef.current = posicionX;
    startPosYRef.current = posicionY;
    setArrastrando(true);
  };

  const handleTouchStart = (e) => {
    if (!e.touches[0]) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    startPosXRef.current = posicionX;
    startPosYRef.current = posicionY;
    setArrastrando(true);
  };

  // BOTÓN PARA CAMBIAR LA FOTO DIRECTAMENTE DESDE EL MODAL
  const handleCambiarFotoEnModal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoNuevaFoto(true);
    try {
      const nombreLimpio = `nueva_foto_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('imagenes_web').upload(`disciplinas/${nombreLimpio}`, file);

      if (error) {
        alert("Error al subir nueva foto: " + error.message);
        return;
      }

      const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`disciplinas/${nombreLimpio}`);
      setUrlImagenActual(data.publicUrl);
      setPosicionX(50);
      setPosicionY(50);
      setZoom(1.2);
    } finally {
      setSubiendoNuevaFoto(false);
    }
  };

  // ZOOM + Y -
  const handleAumentarZoom = () => {
    setZoom((prev) => Math.min(2.5, Number((prev + 0.15).toFixed(2))));
  };

  const handleReducirZoom = () => {
    setZoom((prev) => Math.max(1.0, Number((prev - 0.15).toFixed(2))));
  };

  const handleConfirmar = () => {
    // Envía tanto la posición como la nueva URL si se cambió
    fnGuardar(posicionY, posicionX, urlImagenActual);
  };

  const desplazamientoX = (50 - posicionX) * 1.6 * zoom;
  const desplazamientoY = (50 - posicionY) * 1.6 * zoom;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) fnCerrar(); }}
    >
      {/* CABECERA */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-3 border-b border-white/10 text-white">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00B4A7]/20 text-[#00B4A7]">
            <Crop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight">Acomodar Foto</h3>
            <p className="text-[11px] text-slate-400">Arrastra en cualquier dirección o cambia la foto abajo</p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={fnCerrar} 
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* ÁREA CENTRAL DE ENCUADRE */}
      <div className="w-full max-w-2xl my-auto py-4 flex flex-col items-center">
        
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`relative w-full aspect-[16/10] max-h-[55vh] rounded-2xl overflow-hidden bg-black border-2 border-[#00B4A7] shadow-2xl flex items-center justify-center ${
            arrastrando ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {subiendoNuevaFoto ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#00B4A7] text-xs gap-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Subiendo tu foto original completa...</span>
            </div>
          ) : urlImagenActual ? (
            <img
              src={urlImagenActual}
              alt="Foto para encuadrar"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-75 ease-out"
              style={{ 
                objectPosition: `${posicionX}% ${posicionY}%`,
                transform: `translate(${desplazamientoX}px, ${desplazamientoY}px) scale(${zoom})`
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <ImageIcon className="w-8 h-8 text-slate-600 animate-pulse" />
              <span>Cargando imagen...</span>
            </div>
          )}

          {/* CUADRÍCULA 3x3 ESTILO WHATSAPP */}
          <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div className="border-r border-b border-white/25" />
            <div />
          </div>

          {/* INDICADOR FLOTANTE */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono font-bold text-[#00B4A7] flex items-center gap-1.5 shadow">
            <Move className="w-3 h-3 text-[#F7B52C]" />
            <span>X: {posicionX}% · Y: {posicionY}%</span>
          </div>
        </div>

        {/* CONTROLES DE ZOOM */}
        <div className="w-full max-w-md mt-4 flex items-center justify-between gap-4 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
          
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReducirZoom}
              disabled={zoom <= 1.0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer border border-white/10 shadow"
              title="Alejar imagen (-)"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-28 sm:w-36 accent-[#00B4A7] cursor-pointer h-1.5 bg-white/20 rounded-lg"
            />

            <button
              type="button"
              onClick={handleAumentarZoom}
              disabled={zoom >= 2.5}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer border border-white/10 shadow"
              title="Acercar imagen (+)"
            >
              <Plus className="w-4 h-4" />
            </button>

            <span className="font-mono text-[11px] text-slate-300 ml-1">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setPosicionX(50);
              setPosicionY(50);
              setZoom(1.2);
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5 text-[11px] font-bold"
            title="Recentrar la foto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

        </div>

      </div>

      {/* BARRA INFERIOR CON EL BOTÓN "CAMBIAR FOTO" */}
      <div className="w-full max-w-2xl pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fnCerrar}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {/* BOTÓN PARA SUBIR OTRA FOTO DIRECTAMENTE DESDE EL ENCUADRE */}
          <label className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center gap-2 cursor-pointer transition-all border border-white/15 shadow">
            <Upload className="w-3.5 h-3.5 text-[#F7B52C]" />
            <span>Cambiar Foto</span>
            <input type="file" accept="image/*" onChange={handleCambiarFotoEnModal} className="hidden" />
          </label>
        </div>

        <button
          type="button"
          disabled={subiendoNuevaFoto}
          onClick={handleConfirmar}
          className="px-8 py-3 rounded-full text-xs font-black text-slate-950 bg-[#00B4A7] hover:bg-[#00c9ba] shadow-xl shadow-[#00B4A7]/30 flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Listo</span>
        </button>
      </div>

    </div>
  );
}