import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Ticket 
} from 'lucide-react';
import NotificacionPromo from './NotificacionPromo';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const enlacesIzquierda = [
    { path: '/', label: 'Inicio' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/sedes', label: 'Sedes' }
  ];

  const enlacesDerecha = [
    { path: '/eventos', label: 'Eventos' },
    { path: '/tienda', label: 'Tienda' },
    { path: '/trabaja', label: 'Trabaja' }
  ];

  const todosLosEnlaces = [...enlacesIzquierda, ...enlacesDerecha];

  const esRutaActiva = (ruta) => {
    if (ruta === '/') return location.pathname === '/';
    return location.pathname.startsWith(ruta);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 select-none">
      
      {/* BARRA PRINCIPAL */}
      <div className="relative bg-[#050914]/95 backdrop-blur-md shadow-2xl transition-all duration-300">
        
        {/* LÍNEA SUPERIOR DECORATIVA */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#F7B52C]/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          
          {/* 1. NAVEGACIÓN IZQUIERDA */}
          <nav className="hidden lg:flex items-center justify-end gap-9 w-1/3 pr-12">
            {enlacesIzquierda.map((enlace) => {
              const activo = esRutaActiva(enlace.path);
              return (
                <Link
                  key={enlace.path}
                  to={enlace.path}
                  className={`text-xs font-black uppercase tracking-widest transition-all relative py-2 ${
                    activo 
                      ? 'text-[#F7B52C] drop-shadow-[0_0_12px_rgba(247,181,44,0.6)]' 
                      : 'text-slate-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  {enlace.label}
                  {activo && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F7B52C] rounded-full shadow-[0_0_8px_#F7B52C]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 2. ESCUDO CENTRAL PROMINENTE */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-0 z-30 flex-col items-center">
            <Link
              to="/"
              className="group relative flex flex-col items-center justify-center transition-transform duration-300 hover:scale-[1.03] active:scale-95"
              title="Club Campeones Lima · Inicio"
            >
              <div 
                className="relative w-56 xl:w-64 h-[106px] bg-gradient-to-b from-[#0a1428] via-[#070e1c] to-[#040813] flex flex-col items-center justify-center pt-2 pb-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.95)]"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 82% 100%, 18% 100%)'
                }}
              >
                <div className="absolute top-2 w-20 h-20 bg-[#F7B52C]/10 rounded-full blur-xl pointer-events-none" />

                <img
                  src="/logo.png"
                  alt="Club Campeones Lima"
                  className="w-12 h-12 xl:w-13 xl:h-13 object-contain drop-shadow-[0_4px_15px_rgba(247,181,44,0.5)] transition-transform duration-300 group-hover:scale-110 z-10"
                  onError={(e) => {
                    if (!e.target.dataset.triedSvg) {
                      e.target.dataset.triedSvg = 'true';
                      e.target.src = '/logo.svg';
                    }
                  }}
                />

                <span className="text-xs xl:text-[13px] font-black uppercase tracking-wider text-white mt-1 leading-none font-sans drop-shadow-md z-10">
                  CAMPEONES <span className="text-[#F7B52C]">LIMA</span>
                </span>
                
                <span className="text-[8px] font-mono font-black tracking-widest text-[#00B4A7] uppercase mt-0.5 z-10">
                  ACADEMIA FORMATIVA
                </span>
              </div>

              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                viewBox="0 0 256 106" 
                fill="none"
              >
                <path 
                  d="M 0 0 L 46 105 L 210 105 L 256 0" 
                  stroke="url(#crestaGradiente)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="crestaGradiente" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00B4A7" />
                    <stop offset="50%" stopColor="#F7B52C" />
                    <stop offset="100%" stopColor="#00B4A7" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>
          </div>

          {/* LOGO MÓVIL */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png"
                alt="Logo Campeones Lima"
                className="w-10 h-10 object-contain drop-shadow"
                onError={(e) => {
                  if (!e.target.dataset.triedSvg) {
                    e.target.dataset.triedSvg = 'true';
                    e.target.src = '/logo.svg';
                  }
                }}
              />
              <div>
                <span className="text-sm font-black uppercase text-white leading-tight block">
                  CAMPEONES <span className="text-[#F7B52C]">LIMA</span>
                </span>
                <span className="text-[9px] font-mono font-bold text-[#00B4A7] block tracking-wider">
                  BÁSQUET & VÓLEY
                </span>
              </div>
            </Link>
          </div>

          {/* 3. NAVEGACIÓN DERECHA + BOTONES DE ACCIÓN */}
          <div className="hidden lg:flex items-center justify-between w-1/3 pl-12 gap-6">
            <nav className="flex items-center gap-9">
              {enlacesDerecha.map((enlace) => {
                const activo = esRutaActiva(enlace.path);
                return (
                  <Link
                    key={enlace.path}
                    to={enlace.path}
                    className={`text-xs font-black uppercase tracking-widest transition-all relative py-2 ${
                      activo 
                        ? 'text-[#F7B52C] drop-shadow-[0_0_12px_rgba(247,181,44,0.6)]' 
                        : 'text-slate-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                    }`}
                  >
                    {enlace.label}
                    {activo && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F7B52C] rounded-full shadow-[0_0_8px_#F7B52C]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="/#ticket-cancha"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F7B52C] to-[#e6a524] hover:from-[#ffc247] hover:to-[#F7B52C] text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(247,181,44,0.4)] hover:shadow-[0_0_30px_rgba(247,181,44,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>Clase de Prueba</span>
              </a>
            </div>
          </div>

          {/* ACCIONES MÓVILES */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 rounded-xl bg-[#071527] border border-slate-800 text-white cursor-pointer"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-slate-800 via-transparent to-slate-800" />
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className="lg:hidden bg-[#070e1c] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-3 shadow-2xl">
          {todosLosEnlaces.map((enlace) => {
            const activo = esRutaActiva(enlace.path);
            return (
              <Link
                key={enlace.path}
                to={enlace.path}
                onClick={() => setMenuAbierto(false)}
                className={`block px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activo ? 'bg-[#F7B52C] text-slate-950 shadow-lg' : 'text-slate-200 hover:bg-[#040914]'
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}

          <div className="pt-2">
            <a
              href="/#ticket-cancha"
              onClick={() => setMenuAbierto(false)}
              className="w-full py-3.5 rounded-xl bg-[#F7B52C] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
            >
              <Ticket className="w-4 h-4 text-slate-950" />
              <span>Reservar Clase de Prueba</span>
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          NOTIFICACIÓN FLOTANTE (OPCIÓN A: MONTADA DENTRO DEL NAVBAR)
         ========================================================================= */}
      <NotificacionPromo />

    </header>
  );
}