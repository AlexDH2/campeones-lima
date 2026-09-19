import React, { useState, useRef } from 'react';
import { 
  X, 
  Crop, 
  Check, 
  Eye, 
  EyeOff, 
  Move, 
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react';

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

const obtenerCoordenadasIniciales = (posInicial, posInicialX) => {
  if (typeof posInicial === 'object' && posInicial !== null) {
    return {
      x: normalizarCoordenada(posInicial.x),
      y: normalizarCoordenada(posInicial.y)
    };
  }
  return {
    x: normalizarCoordenada(posInicialX),
    y: normalizarCoordenada(posInicial)
  };
};

export default function ModalEncuadre({
  abierto,
  alCerrar,
  imagenUrl,
  posicionInicial = 50,
  posicionInicialX = 50,
  alGuardar,
  esHero = false,
  esSede = false,
  sedeData = null
}) {
  const [posX, setPosX] = useState(() => obtenerCoordenadasIniciales(posicionInicial, posicionInicialX).x);
  const [posY, setPosY] = useState(() => obtenerCoordenadasIniciales(posicionInicial, posicionInicialX).y);
  const [simularOverlay, setSimularOverlay] = useState(esHero || esSede);
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const visorRef = useRef(null);
  const arrastreInicioRef = useRef(null);

  if (!abierto) return null;

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setEstaArrastrando(true);
    arrastreInicioRef.current = {
      inicioMouseX: e.clientX,
      inicioMouseY: e.clientY,
      inicioPosX: posX,
      inicioPosY: posY,
    };
  };

  const handlePointerMove = (e) => {
    if (!estaArrastrando || !arrastreInicioRef.current || !visorRef.current) return;

    const rect = visorRef.current.getBoundingClientRect();
    const deltaX = e.clientX - arrastreInicioRef.current.inicioMouseX;
    const deltaY = e.clientY - arrastreInicioRef.current.inicioMouseY;

    const factorSensibilidad = 0.9;
    const porcentajeMovX = (deltaX / rect.width) * 100 * factorSensibilidad;
    const porcentajeMovY = (deltaY / rect.height) * 100 * factorSensibilidad;

    const nuevoX = Math.round(Math.min(100, Math.max(0, arrastreInicioRef.current.inicioPosX - porcentajeMovX)));
    const nuevoY = Math.round(Math.min(100, Math.max(0, arrastreInicioRef.current.inicioPosY - porcentajeMovY)));

    setPosX(nuevoX);
    setPosY(nuevoY);
  };

  const handlePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar si el puntero ya no está capturado
    }
    setEstaArrastrando(false);
    arrastreInicioRef.current = null;
  };

  const handleRestablecer = () => {
    setPosX(50);
    setPosY(50);
  };

  const handleConfirmar = async () => {
    if (!alGuardar) {
      alCerrar();
      return;
    }

    setGuardando(true);
    try {
      // Envía únicamente el objeto de coordenadas
      const resultado = await alGuardar({ x: posX, y: posY });
      // Cierra únicamente si el guardado reportó true
      if (resultado === true) {
        alCerrar();
      }
    } catch (err) {
      console.error("Error al guardar encuadre:", err);
    } finally {
      setGuardando(false);
    }
  };

  const nombreCanchaActual = sedeData?.nombre || "SEDE LIBERTADORES-CANCHA VOLEY";
  const distritoCanchaActual = sedeData?.distrito || "Lima";

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in select-none"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) alCerrar(); }}
    >
      <div className="bg-[#071527] border border-slate-700 w-full max-w-4xl rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#F7B52C]" />
            <div>
              <h3 className="text-base font-black text-white">
                {esHero 
                  ? "Encuadre del Banner Hero (Portada)" 
                  : esSede 
                  ? "Encuadre del Fondo Panorámico de Canchas (/sedes)" 
                  : "Encuadre de Imagen"}
              </h3>
              <p className="text-xs text-slate-400">
                {esHero 
                  ? "Acomoda la foto y verifica que los textos del Hero no tapen los rostros ni el trofeo." 
                  : esSede 
                  ? "Arrastra libremente la foto para verificar que el título ni la placa tapen la red o la cancha."
                  : "Haz clic y arrastra la foto con el ratón para acomodar el encuadre."}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={alCerrar} 
            disabled={guardando}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BARRA DE HERRAMIENTAS */}
        <div className="flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={handleRestablecer}
            disabled={guardando}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00B4A7]" />
            <span>Centrar (50%)</span>
          </button>

          {(esHero || esSede) && (
            <button
              type="button"
              onClick={() => setSimularOverlay(!simularOverlay)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                simularOverlay 
                  ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow' 
                  : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {simularOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{simularOverlay ? 'Textos del Banner: Visibles' : 'Ocultar textos de prueba'}</span>
            </button>
          )}
        </div>

        {/* LIENZO INTERACTIVO */}
        <div 
          ref={visorRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center touch-none select-none transition-shadow ${
            esSede
              ? 'aspect-[16/8] sm:aspect-[16/7]'
              : esHero 
              ? 'aspect-video sm:aspect-[16/9]' 
              : 'aspect-square max-w-sm mx-auto'
          } ${estaArrastrando ? 'cursor-grabbing ring-2 ring-[#00B4A7]/60' : 'cursor-grab'}`}
          style={{
            backgroundImage: `url("${imagenUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: `${posX}% ${posY}%`
          }}
        >
          <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-sm text-slate-300 text-[10px] font-medium px-2 py-1 rounded-lg border border-white/10 pointer-events-none flex items-center gap-1 z-20">
            <Move className="w-3 h-3 text-[#F7B52C]" />
            <span>Arrastra para mover</span>
          </div>

          {esHero && simularOverlay && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[#040813] via-[#040813]/85 lg:via-[#040813]/60 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040813] via-transparent to-black/40 pointer-events-none" />

              <div className="absolute inset-0 p-4 sm:p-7 flex flex-col justify-center text-left pointer-events-none max-w-sm sm:max-w-md">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#071527]/90 border-l-2 border-[#F7B52C] text-[8px] sm:text-[9px] font-mono text-slate-100 font-bold mb-1.5 w-fit">
                  TEMPORADA 2026 · OFICIAL
                </div>
                <span className="text-xs sm:text-sm font-black uppercase text-slate-200 leading-none">
                  FORMAMOS
                </span>
                <h2 className="text-base sm:text-2xl font-black uppercase italic text-[#F7B52C] leading-tight my-0.5 drop-shadow">
                  LÍDERES EN LA CANCHA
                </h2>
                <span className="text-[11px] sm:text-xs font-black uppercase text-white leading-tight">
                  PARA TRIUNFAR EN LA VIDA
                </span>

                <div className="flex gap-2 mt-2.5">
                  <span className="px-2 py-1 rounded-md bg-[#F7B52C] text-slate-950 font-black text-[8px] sm:text-[9px] uppercase shadow">
                    Reclama tu clase
                  </span>
                  <span className="px-2 py-1 rounded-md bg-[#0a1122] border border-slate-700 text-white font-bold text-[8px] sm:text-[9px]">
                    Nuestras 6 Sedes
                  </span>
                </div>
              </div>
            </>
          )}

          {esSede && simularOverlay && (
            <>
              <div className="absolute inset-0 bg-black/35 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-[#040914]/25 to-[#040914]/50 pointer-events-none" />

              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col items-center justify-center text-center pointer-events-none max-w-2xl mx-auto space-y-2 sm:space-y-3 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071527]/90 border border-slate-700 shadow-xl backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-[#F7B52C]" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#00B4A7]">
                    Infraestructura Oficial Techada
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white italic drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] leading-tight">
                  Nuestras Canchas & Sedes
                </h1>

                <p className="text-[10px] sm:text-xs text-slate-100 font-bold leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] px-2 max-w-xl">
                  Entrena en coliseos techados de primer nivel con piso protegido, tableros oficiales e iluminación profesional en los principales distritos de Lima.
                </p>

                <div className="pt-1 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#071527]/95 border border-slate-700 backdrop-blur-md shadow-xl text-[10px] sm:text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#00B4A7] animate-pulse" />
                    <span className="text-slate-300 font-bold">Cancha en pantalla:</span>
                    <strong className="text-white uppercase tracking-wide">{nombreCanchaActual}</strong>
                    {distritoCanchaActual && (
                      <span className="text-[#F7B52C] font-mono font-bold">({distritoCanchaActual})</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white font-mono text-[10px] px-2.5 py-1 rounded-lg border border-white/20 pointer-events-none z-20">
            X: {posX}% · Y: {posY}%
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={alCerrar}
            disabled={guardando}
            className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={guardando}
            className="px-6 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00B4A7]/20 transition-all cursor-pointer"
          >
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{guardando ? "Guardando..." : "Guardar Encuadre"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}