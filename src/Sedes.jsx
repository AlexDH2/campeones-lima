import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  AlertTriangle,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { estaSuspendida } from './domain';
import { useSedes, useConfiguracionClaves, useWhatsAppGlobal } from './queries';

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

const limpiarClave = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

const aMinusculasLimpio = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[0-9]/g, '')
    .replace(/[^a-záéíóúüñ\s]/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
};

const aTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bDe\b/g, 'de')
    .replace(/\bY\b/g, 'y')
    .replace(/\bEn\b/g, 'en')
    .replace(/\bDel\b/g, 'del');
};

export default function Sedes() {
  const WHATSAPP_PHONE = useWhatsAppGlobal();
  const { data: sedes = [], isLoading: cargandoSedes } = useSedes();
  const { data: configMap = {}, isLoading: cargandoConfig } = useConfiguracionClaves(['banner_canchas_sedes']);

  const cargando = cargandoSedes || cargandoConfig;
  const [busqueda, setBusqueda] = useState('');
  const [distritoFiltro, setDistritoFiltro] = useState('TODOS');
  const [deporteFiltro, setDeporteFiltro] = useState('TODOS');
  const [canchaActivaIdx, setCanchaActivaIdx] = useState(0);

  // Derivación de fondos
  const canchasFondo = useMemo(() => {
    const banner = configMap.banner_canchas_sedes;
    if (Array.isArray(banner) && banner.length > 0) return banner;

    const lista = [];
    sedes.forEach(s => {
      const fotosSede = Array.isArray(s.imagenes) && s.imagenes.length > 0 
        ? s.imagenes 
        : [s.foto_principal].filter(Boolean);

      fotosSede.forEach(itemFoto => {
        const urlFoto = typeof itemFoto === 'string' ? itemFoto : (itemFoto?.url || itemFoto?.imagen || '');
        if (!urlFoto) return;

        const pos = s.posiciones_fotos?.[urlFoto];
        lista.push({
          url: urlFoto,
          sedeNombre: s.nombre,
          distrito: aMinusculasLimpio(s.distrito),
          posX: typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.x) : 50,
          posY: typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.y) : normalizarCoordenada(pos)
        });
      });
    });
    return lista;
  }, [configMap.banner_canchas_sedes, sedes]);

  useEffect(() => {
    if (canchasFondo.length <= 1) return;
    const timer = setInterval(() => {
      setCanchaActivaIdx(prev => (prev + 1) % canchasFondo.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [canchasFondo.length]);

  const canchaActual = canchasFondo[canchaActivaIdx] || null;

  // Distritos con cantidad de sedes
  const distritosDisponibles = useMemo(() => {
    const mapaConteo = new Map();
    sedes.forEach(s => {
      const clave = aTitleCase(aMinusculasLimpio(s.distrito));
      if (!clave) return;
      mapaConteo.set(clave, (mapaConteo.get(clave) || 0) + 1);
    });
    return Array.from(mapaConteo.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [sedes]);

  const sedesFiltradas = sedes.filter(s => {
    const coincideDistrito = 
      distritoFiltro === 'TODOS' || 
      limpiarClave(s.distrito) === limpiarClave(distritoFiltro);

    const coincideDeporte = 
      deporteFiltro === 'TODOS' ||
      (s.disciplinas_disponibles || ['Básquetbol', 'Voleibol']).some(
        d => limpiarClave(d) === limpiarClave(deporteFiltro)
      );

    const coincideTexto = 
      !busqueda.trim() ||
      limpiarClave(s.nombre).includes(limpiarClave(busqueda)) ||
      limpiarClave(s.distrito).includes(limpiarClave(busqueda)) ||
      limpiarClave(s.direccion).includes(limpiarClave(busqueda));

    return coincideTexto && coincideDistrito && coincideDeporte;
  });

  const limpiarFiltros = () => {
    setBusqueda('');
    setDistritoFiltro('TODOS');
    setDeporteFiltro('TODOS');
  };

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

            {/* PÍLDORAS DE VALOR DEPORTIVO */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071527]/90 border border-[#00B4A7]/40 text-xs font-bold text-white shadow-lg backdrop-blur-md hover:border-[#00B4A7] transition-all">
                <span className="w-2 h-2 rounded-full bg-[#00B4A7]" />
                <span>8 Coliseos Techados</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071527]/90 border border-[#F7B52C]/40 text-xs font-bold text-white shadow-lg backdrop-blur-md hover:border-[#F7B52C] transition-all">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F7B52C]" />
                <span>Piso Protegido & Seguro</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071527]/90 border border-cyan-500/40 text-xs font-bold text-white shadow-lg backdrop-blur-md hover:border-cyan-400 transition-all">
                <span>🏀 Tableros & Redes Oficiales</span>
              </span>
            </div>

            {/* CANCHA EN PANTALLA REFINADA */}
            {canchaActual && (
              <div className="pt-2 flex items-center justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#071527]/95 border border-slate-700/90 backdrop-blur-md shadow-2xl text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00B4A7] animate-ping" />
                  <span className="text-slate-400 font-medium">Cancha en pantalla:</span>
                  <strong className="text-white tracking-wide font-black">
                    {aTitleCase(canchaActual.sedeNombre || 'Coliseo Oficial')}
                  </strong>
                  {canchaActual.distrito && (
                    <span className="text-[#F7B52C] font-mono font-bold">
                      ({aTitleCase(canchaActual.distrito)})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FILTROS Y BÚSQUEDA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 relative z-10">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#071527] shadow-xl space-y-4">
          
          {/* BUSCADOR Y FILTROS POR DEPORTE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

            {/* FILTRO DE DEPORTES */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Deporte:</span>
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'Básquetbol', label: '🏀 Básquet' },
                { id: 'Voleibol', label: '🏐 Vóley' }
              ].map(dep => {
                const activo = deporteFiltro === dep.id;
                return (
                  <button
                    key={dep.id}
                    type="button"
                    onClick={() => setDeporteFiltro(dep.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      activo
                        ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow-md shadow-[#F7B52C]/20'
                        : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {dep.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILTRO DE DISTRITOS CON CONTEO */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00B4A7]" /> Distrito:
            </span>

            <button
              type="button"
              onClick={() => setDistritoFiltro('TODOS')}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                distritoFiltro === 'TODOS'
                  ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow font-black'
                  : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              Todos ({sedes.length})
            </button>

            {distritosDisponibles.map((dist, i) => {
              const activo = limpiarClave(distritoFiltro) === limpiarClave(dist.nombre);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDistritoFiltro(dist.nombre)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    activo
                      ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow font-black'
                      : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {dist.nombre} ({dist.cantidad})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE SEDES */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 relative z-10">
        {cargando ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Sedes y Canchas...</p>
          </div>
        ) : sedesFiltradas.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-slate-800 bg-[#071527] text-slate-400 text-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00B4A7]/15 text-[#00B4A7] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-white">No encontramos sedes con los filtros seleccionados</p>
              <p className="text-slate-400">Prueba cambiando el distrito o deporte, o restablece los filtros.</p>
            </div>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4A7] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#00c9ba] transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Filtros</span>
            </button>
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

              const nombreLower = (s.nombre || '').toLowerCase();
              const esBN = nombreLower.includes('buenas nuevas');
              const esFatima = nombreLower.includes('fátima') || nombreLower.includes('fatima');

              const nombreLimpio = aTitleCase(s.nombre);
              const distritoLimpio = aTitleCase(aMinusculasLimpio(s.distrito));

              return (
                <div 
                  key={s.id} 
                  className={`border bg-[#071527] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 ${
                    esBN 
                      ? 'border-[#F7B52C]/60 hover:border-[#F7B52C] hover:shadow-[0_12px_35px_rgba(247,181,44,0.22)]' 
                      : 'border-slate-800 hover:border-[#00B4A7]/60 hover:shadow-[0_12px_35px_rgba(0,180,167,0.18)]'
                  }`}
                >
                  <div>
                    {/* FOTO O PLACEHOLDER DE ALTO NIVEL */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      {fotoPortada ? (
                        <img 
                          loading="lazy" 
                          src={fotoPortada} 
                          alt={nombreLimpio} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          style={{ objectPosition: `${posX}% ${posY}%` }}
                        />
                      ) : (
                        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#061021] via-[#091833] to-[#040914] flex flex-col items-center justify-center p-6 text-center select-none">
                          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00B4A7_1px,transparent_1px)] [background-size:16px_16px]" />
                          <img src="/logo.png" alt="Logo Campeones Lima" className="w-12 h-12 object-contain opacity-35 mb-2 group-hover:scale-110 transition-transform duration-500" />
                          <span className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[#F7B52C] font-mono text-[10px] font-bold shadow-lg">
                            <Sparkles className="w-3 h-3 text-[#F7B52C]" />
                            <span>Fotografía oficial en producción</span>
                          </span>
                        </div>
                      )}
                      
                      {/* PÍLDORA DISTRITO */}
                      <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{distritoLimpio}</span>
                      </span>

                      {/* BADGES ESPECIALES */}
                      {esBN ? (
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-[#F7B52C] to-[#ffc247] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md flex items-center gap-1 animate-pulse">
                          ⭐ ¡NUEVA SEDE! · 28 Nov
                        </span>
                      ) : esFatima ? (
                        <span className="absolute top-3 right-3 bg-cyan-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                          ⏳ Apertura Verano
                        </span>
                      ) : suspendida ? (
                        <span className="absolute top-3 right-3 bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Suspendida
                        </span>
                      ) : null}

                      {fotos.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/85 text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow backdrop-blur-sm">
                          <ImageIcon className="w-3 h-3 text-[#00B4A7]" />
                          <span>{fotos.length} fotos</span>
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-black text-lg text-white group-hover:text-[#F7B52C] transition-colors leading-tight">
                          {nombreLimpio}
                        </h3>
                        <p className="text-xs line-clamp-2 text-slate-400 mt-1 leading-relaxed">{s.direccion}</p>
                      </div>

                      {/* DISCIPLINAS Y TURNOS */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(s.disciplinas_disponibles || ['Básquetbol', 'Voleibol']).map((dep, i) => {
                          const esVoley = dep.toLowerCase().includes('voley') || dep.toLowerCase().includes('voleibol');
                          return (
                            <span 
                              key={i} 
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                                esVoley
                                  ? 'bg-[#00B4A7]/10 text-[#00B4A7] border-[#00B4A7]/30'
                                  : 'bg-[#F7B52C]/10 text-[#F7B52C] border-[#F7B52C]/30'
                              }`}
                            >
                              <span>{esVoley ? '🏐' : '🏀'}</span>
                              <span>{dep}</span>
                            </span>
                          );
                        })}
                        <span className="text-[10px] text-slate-400 font-mono py-0.5 px-1">
                          · {(s.horarios || []).length} turnos
                        </span>
                      </div>

                      {/* TARIFA REFERENCIAL */}
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00B4A7]" />
                          <span>Coliseo 100% Techado</span>
                        </span>
                        <span className="font-mono font-black text-[#F7B52C]">
                          {s.horarios?.[0]?.precio_mes ? `Desde S/ ${s.horarios[0].precio_mes}/mes` : 'Planes de Verano'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/sedes/${s.id}`}
                      className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center text-center gap-2 shadow-lg transition-all cursor-pointer group-hover:shadow-[0_4px_20px_rgba(0,180,167,0.3)] ${
                        esBN 
                          ? 'bg-[#F7B52C] hover:bg-[#ffc247] text-slate-950' 
                          : 'bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950'
                      }`}
                    >
                      <span>{esBN ? 'Ver Clase 28 Nov & Horarios' : 'Ver Fotos, Cancha & Horarios'}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* SECCIÓN DE ASESORÍA PERSONALIZADA (ANTES DEL FOOTER) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 relative z-10">
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#071527] via-[#0b1c36] to-[#071527] border-2 border-[#00B4A7]/40 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-[#00B4A7]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 text-left relative z-10 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4A7] bg-[#00B4A7]/10 px-3 py-1 rounded-full border border-[#00B4A7]/30">
              ¿Dudas sobre cuál sede elegir?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white italic">
              Te Asesoramos de Inmediato por WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Indícanos tu distrito de residencia, la edad de tu hijo(a) y el deporte de interés. Te enviaremos la sede más cercana y los horarios exactos disponibles.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('¡Hola Campeones Lima! Deseo asesoría para elegir la mejor sede y horario para mi hijo(a).')}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative z-10"
          >
            <MessageCircle className="w-5 h-5 fill-slate-950" />
            <span>Consultar Sede Cercana</span>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
