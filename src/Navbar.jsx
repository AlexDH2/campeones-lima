import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Ticket
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const { alternarTema = () => {}, esOscuro = true } = useTheme() || {};

  const enlaces = [
    { path: '/', label: 'Inicio' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/sedes', label: 'Sedes' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/tienda', label: 'Tienda' },
    { path: '/trabaja', label: 'Trabaja con Nosotros' }
  ];

  const esRutaActiva = (ruta) => {
    if (ruta === '/') return location.pathname === '/';
    return location.pathname.startsWith(ruta);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
      esOscuro 
        ? 'bg-[#040914]/90 border-slate-800/80 text-slate-100' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO OFICIAL */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <img 
            src="/logo.png" 
            alt="Logo Club Campeones Lima" 
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_2px_12px_rgba(0,180,167,0.35)]"
            onError={(e) => {
              if (!e.target.dataset.triedSvg) {
                e.target.dataset.triedSvg = 'true';
                e.target.src = '/logo.svg';
              }
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-base sm:text-lg font-black tracking-tight uppercase block leading-tight ${
                esOscuro ? 'text-white' : 'text-slate-900'
              }`}>
                CAMPEONES LIMA
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#00B4A7]/15 text-[#00B4A7] px-1.5 py-0.2 rounded border border-[#00B4A7]/30">
                2015
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mt-0.5">
              <span className="text-[#F7B52C]">🏀 BÁSQUET</span> & <span className="text-[#00B4A7]">🏐 VÓLEY FORMATIVO</span>
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DE ESCRITORIO */}
        <nav className={`hidden lg:flex items-center gap-1 p-1.5 rounded-2xl border ${
          esOscuro ? 'bg-[#071527]/80 border-slate-800/80' : 'bg-slate-100/90 border-slate-200'
        }`}>
          {enlaces.map((enlace) => {
            const activo = esRutaActiva(enlace.path);
            return (
              <Link
                key={enlace.path}
                to={enlace.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  activo
                    ? 'bg-[#00B4A7] text-slate-950 shadow-md shadow-[#00B4A7]/20'
                    : esOscuro 
                      ? 'text-slate-300 hover:text-white hover:bg-[#040914]'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN TEMA + BOTÓN CLASE DE PRUEBA */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            aria-label="Cambiar tema de color"
            onClick={alternarTema}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              esOscuro 
                ? 'bg-[#071527] border-slate-800 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-950'
            }`}
            title="Cambiar tema de color"
          >
            {esOscuro ? <Sun className="w-4 h-4 text-[#F7B52C]" /> : <Moon className="w-4 h-4 text-cyan-500" />}
          </button>

          <a
            href="/#ticket-cancha"
            className="px-5 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00B4A7]/25 transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5 text-slate-950" />
            <span>Clase de Prueba</span>
          </a>
        </div>

        {/* BOTÓN MÓVIL HAMBURGUESA */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={alternarTema}
            className={`p-2 rounded-xl border ${
              esOscuro ? 'bg-[#071527] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {esOscuro ? <Sun className="w-4 h-4 text-[#F7B52C]" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`p-2 rounded-xl border ${
              esOscuro ? 'bg-[#071527] border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className={`lg:hidden border-b px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-3 ${
          esOscuro ? 'bg-[#071527] border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}>
          {enlaces.map((enlace) => {
            const activo = esRutaActiva(enlace.path);
            return (
              <Link
                key={enlace.path}
                to={enlace.path}
                onClick={() => setMenuAbierto(false)}
                className={`block px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  activo 
                    ? 'bg-[#00B4A7] text-slate-950' 
                    : esOscuro ? 'text-slate-300 hover:bg-[#040914]' : 'text-slate-700 hover:bg-slate-100'
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
              className="w-full py-3.5 rounded-xl bg-[#00B4A7] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Ticket className="w-4 h-4" />
              <span>Reservar Clase de Prueba</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}