import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  AlertTriangle 
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { supabase } from './supabase';
import { estaSuspendida } from './domain';

// Función para normalizar coordenadas numéricas preservando el 0 %
const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

// Función para comparar: solo letras en minúsculas (omite espacios, números, tildes y símbolos)
const limpiarClave = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

// Función para mostrar en pantalla: todo en minúsculas, sin números ni símbolos
const aMinusculasLimpio = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[0-9]/g, '')
    .replace(/[^a-záéíóúüñ\s]/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
};

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [distritoFiltro, setDistritoFiltro] = useState('TODOS');

  const [canchasFondo, setCanchasFondo] = useState([]);
  const [canchaActivaIdx, setCanchaActivaIdx] = useState(0);

  useEffect(() => {
    async function cargarSedesYFondo() {
      try {
        const [resSedes, resConfig] = await Promise.all([
          supabase.from('sedes').select('*').order('created_at', { ascending: true }),
          supabase.from('configuracion_web').select('valor').eq('clave', 'banner_canchas_sedes').maybeSingle()
        ]);

        if (resSedes.data && resSedes.data.length > 0) {
          setSedes(resSedes.data);
        }

        if (resConfig.data?.valor && Array.isArray(resConfig.data.valor) && resConfig.data.valor.length > 0) {
          setCanchasFondo(resConfig.data.valor);
        } else if (resSedes.data && resSedes.data.length > 0) {
          const listaCanchas = [];
          resSedes.data.forEach(s => {
            const fotosSede = Array.isArray(s.imagenes) && s.imagenes.length > 0 
              ? s.imagenes 
              : [s.foto_principal].filter(Boolean);

            fotosSede.forEach(itemFoto => {
              const urlFoto = typeof itemFoto === 'string' ? itemFoto : (itemFoto?.url || itemFoto?.imagen || '');
              if (!urlFoto) return;

              const pos = s.posiciones_fotos?.[urlFoto];
              listaCanchas.push({
                url: urlFoto,
                sedeNombre: s.nombre,
                distrito: aMinusculasLimpio(s.distrito),
                posX: typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.x) : 50,
                posY: typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.y) : normalizarCoordenada(pos)
              });
            });
          });

          setCanchasFondo(listaCanchas);
        }
      } catch (err) {
        console.error('Error al cargar sedes y fondo:', err);
      } finally {
        setCargando(false);
      }
    }
    cargarSedesYFondo();
  }, []);

  useEffect(() => {
    if (canchasFondo.length <= 1) return;
    const timer = setInterval(() => {
      setCanchaActivaIdx(prev => (prev + 1) % canchasFondo.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [canchasFondo.length]);

  const canchaActual = canchasFondo[canchaActivaIdx] || null;

  const distritosDisponibles = useMemo(() => {
    const mapaUnicos = new Map();
    sedes.forEach(s => {
      const clave = limpiarClave(s.distrito);
      if (!clave) return;
      if (!mapaUnicos.has(clave)) {
        mapaUnicos.set(clave, aMinusculasLimpio(s.distrito));
      }
    });
    return Array.from(mapaUnicos.values()).sort();
  }, [sedes]);

  const sedesFiltradas = sedes.filter(s => {
    const coincideDistrito = 
      distritoFiltro === 'TODOS' || 
      limpiarClave(s.distrito) === limpiarClave(distritoFiltro);

    const coincideTexto = 
      !busqueda.trim() ||
      limpiarClave(s.nombre).includes(limpiarClave(busqueda)) ||
      limpiarClave(s.distrito).includes(limpiarClave(busqueda)) ||
      limpiarClave(s.direccion).includes(limpiarClave(busqueda));

    return coincideTexto && coincideDistrito;
  });

  return (
    <div className="min-h-screen font-sans bg-[#040914] text-slate-100 relative overflow-hidden">
      <Navbar />

      {/* CABECERA PANORÁMICA DE CANCHAS */}
      <header className="relative min-h-[65vh] sm:min-h-[75vh] flex items-center overflow-hidden z-10 border-b border-slate-800 pt-28 pb-16">
        
        {canchasFondo.length > 0 && (
          <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
            {canchasFondo.map((cancha, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === canchaActivaIdx ? 'opacity-95 sm:opacity-100 scale-100' : 'opacity-0 scale-100'
                }`}
                style={{
                  backgroundImage: `url("${cancha.url}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: `${normalizarCoordenada(cancha.posX)}% ${normalizarCoordenada(cancha.posY)}%`,
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '1600ms'
                }}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-[#040914] via-[#040914]/90 lg:via-[#040914]/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-transparent to-black/40" />
          </div>
        )}

        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl space-y-5 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#071527]/95 border border-slate-700 shadow-xl backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#F7B52C]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00B4A7]">
                Infraestructura Oficial Techada
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase italic tracking-tight text-white drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)] leading-none">
              Nuestras <br className="hidden sm:block" />
              <span className="text-[#F7B52C]">Canchas & Sedes</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-200 font-medium max-w-xl leading-relaxed drop-shadow-md border-l-2 border-slate-700/80 pl-3 text-left">
              Entrena en coliseos techados de primer nivel con piso protegido, tableros oficiales e iluminación profesional en los principales distritos de Lima.
            </p>

            {canchaActual && (
              <div className="pt-2 flex items-center justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#071527]/95 border border-slate-700 backdrop-blur-md shadow-2xl text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#00B4A7] animate-pulse" />
                  <span className="text-slate-300 font-bold">Cancha en pantalla:</span>
                  <strong className="text-white uppercase tracking-wide">{canchaActual.sedeNombre || 'Coliseo Oficial'}</strong>
                  {canchaActual.distrito && (
                    <span className="text-[#F7B52C] font-mono font-bold">({aMinusculasLimpio(canchaActual.distrito)})</span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* FILTROS POR DISTRITO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 relative z-10">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#071527] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar sede por nombre, distrito o dirección..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold border border-slate-800 bg-[#040914] text-white placeholder-slate-500 transition-colors focus:outline-none focus:border-[#00B4A7]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDistritoFiltro('TODOS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                distritoFiltro === 'TODOS'
                  ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow font-black'
                  : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              todos ({sedes.length})
            </button>

            {distritosDisponibles.map((dist, i) => {
              const activo = limpiarClave(distritoFiltro) === limpiarClave(dist);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDistritoFiltro(dist)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    activo
                      ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow font-black'
                      : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {dist}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE SEDES */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
        {cargando ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Sedes y Canchas...</p>
          </div>
        ) : sedesFiltradas.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-slate-800 bg-[#071527] text-slate-400 text-xs space-y-2">
            <p className="text-base font-black text-white">No se encontraron sedes con esos filtros</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sedesFiltradas.map((s) => {
              const fotos = Array.isArray(s.imagenes) && s.imagenes.length > 0 
                ? s.imagenes 
                : [s.foto_principal].filter(Boolean);

              const fotoPortada = s.foto_principal || fotos[0] || '';
              const pos = s.posiciones_fotos?.[fotoPortada];
              const posX = typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.x) : 50;
              const posY = typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.y) : normalizarCoordenada(pos);
              const suspendida = estaSuspendida(s);

              return (
                <div key={s.id} className="border border-slate-800 hover:border-slate-700 bg-[#071527] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all duration-300">
                  <div>
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      {fotoPortada ? (
                        <img 
                          src={fotoPortada} 
                          alt={s.nombre} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          style={{ objectPosition: `${posX}% ${posY}%` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                          Foto en preparación
                        </div>
                      )}
                      
                      <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow">
                        📍 {aMinusculasLimpio(s.distrito)}
                      </span>

                      {suspendida && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded shadow flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Suspendida
                        </span>
                      )}

                      {fotos.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/85 text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow">
                          <ImageIcon className="w-3 h-3 text-[#00B4A7]" />
                          <span>{fotos.length} fotos</span>
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-black text-lg text-white group-hover:text-[#F7B52C] transition-colors leading-tight">
                        {s.nombre}
                      </h3>
                      <p className="text-xs line-clamp-2 text-slate-400">{s.direccion}</p>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {(s.disciplinas_disponibles || ['Básquetbol', 'Voleibol']).map((dep, i) => (
                          <span key={i} className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#00B4A7]/10 text-[#00B4A7] border border-[#00B4A7]/30">
                            {dep}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 font-mono py-0.5">
                          · {(s.horarios || []).length} turnos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/sedes/${s.id}`}
                      className="w-full py-3 px-4 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center text-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <span>Ver Fotos, Cancha & Horarios</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}