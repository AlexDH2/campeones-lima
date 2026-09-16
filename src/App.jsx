import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Award, 
  MessageCircle, 
  Check, 
  Loader2, 
  Ticket, 
  Zap, 
  RotateCcw, 
  X, 
  AlertTriangle 
} from 'lucide-react';

import Navbar from './Navbar';
import Footer from './Footer';
import Sedes from './Sedes';
import SedeDetalle from './SedeDetalle';
import Nosotros from './Nosotros';
import Tienda from './Tienda';
import TrabajaConNosotros from './TrabajaConNosotros';
import Eventos from './Eventos';
const Admin = lazy(() => import('./Admin'));
import Terminos from './Terminos';
import NoEncontrado from './NoEncontrado';
import { precioValido, mostrarPrecio, promocionVigente, estaSuspendida } from './domain';
import { ThemeProvider, useTheme } from './ThemeContext';
import { supabase } from './supabase';

function PaginaInicio() {
  const { esOscuro = true } = useTheme();
  const WHATSAPP_PHONE = "51963896985";

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorConsulta, setErrorConsulta] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');
  const [heroFotos, setHeroFotos] = useState([]);
  const [bannerPosiciones, setBannerPosiciones] = useState({});
  const [fotoActivaIdx, setFotoActivaIdx] = useState(0);
  const [sedes, setSedes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [preciosClaseModelo, setPreciosClaseModelo] = useState({});
  const [categoriasEdades, setCategoriasEdades] = useState([]);

  const [promocionActiva, setPromocionActiva] = useState(null);
  const [mostrarModalFlyer, setMostrarModalFlyer] = useState(false);

  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formSede, setFormSede] = useState('');
  const [formDeporte, setFormDeporte] = useState('Básquetbol');
  const [formEdad, setFormEdad] = useState('');
  const [enviandoForm, setEnviandoForm] = useState(false);
  const [formEnviadoExito, setFormEnviadoExito] = useState(false);

  useEffect(() => {
    async function cargarDatosReales() {
      try {
        const [resConfig, resSedes] = await Promise.all([
          supabase.from('configuracion_web').select('clave, valor').in('clave', [
            'banner_hero_inicio',
            'banner_sedes',
            'banner_inicio',
            'banner_posiciones',
            'inicio_disciplinas',
            'tarjetas_disciplina',
            'disciplinas_inicio',
            'disciplinas',
            'redes_sociales',
            'precios_clase_modelo',
            'categorias_edades',
            'promociones_vigentes'
          ]).throwOnError(),
          supabase.from('sedes').select('*').order('created_at', { ascending: true }).throwOnError()
        ]);

        if (resSedes.data && resSedes.data.length > 0) {
          setSedes(resSedes.data);
          setFormSede(resSedes.data[0].nombre);
        }

        if (resConfig.data) {
          const configMap = {};
          resConfig.data.forEach(item => { configMap[item.clave] = item.valor; });

          let bannerGuardado = null;
          if (configMap.banner_hero_inicio !== undefined) {
            bannerGuardado = configMap.banner_hero_inicio;
          } else if (configMap.banner_sedes !== undefined) {
            bannerGuardado = configMap.banner_sedes;
          } else if (configMap.banner_inicio !== undefined) {
            bannerGuardado = configMap.banner_inicio;
          }

          if (Array.isArray(bannerGuardado) && bannerGuardado.length > 0) {
            setHeroFotos(bannerGuardado);
          } else if (resSedes.data && resSedes.data.length > 0) {
            const todasLasCanchas = [];
            resSedes.data.forEach(s => {
              const fotos = Array.isArray(s.imagenes) && s.imagenes.length > 0 ? s.imagenes : [s.foto_principal].filter(Boolean);
              fotos.forEach(f => todasLasCanchas.push(f));
            });
            if (todasLasCanchas.length > 0) {
              setHeroFotos(todasLasCanchas);
            }
          }

          if (configMap.banner_posiciones) setBannerPosiciones(configMap.banner_posiciones);

          const discGuardadas = configMap.inicio_disciplinas || 
                                configMap.tarjetas_disciplina || 
                                configMap.disciplinas_inicio || 
                                configMap.disciplinas;

          if (discGuardadas && Array.isArray(discGuardadas) && discGuardadas.length > 0) {
            setDisciplinas(discGuardadas);
          }

          if (configMap.precios_clase_modelo && typeof configMap.precios_clase_modelo === 'object') {
            setPreciosClaseModelo(configMap.precios_clase_modelo);
          }

          if (configMap.categorias_edades && Array.isArray(configMap.categorias_edades)) {
            setCategoriasEdades(configMap.categorias_edades);
            if (configMap.categorias_edades[0]?.nombre) setFormEdad(configMap.categorias_edades[0].nombre);
          }

          const promosGuardadas = configMap.promociones_vigentes;
          if (Array.isArray(promosGuardadas) && promosGuardadas.length > 0) {
            const activa = promosGuardadas.find(p => promocionVigente(p));
            if (activa) setPromocionActiva(activa);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setErrorConsulta("No pudimos cargar las sedes y tarifas. Recarga la página para intentar nuevamente.");
      } finally {
        setCargandoDatos(false);
      }
    }
    cargarDatosReales();
  }, []);

  useEffect(() => {
    if (heroFotos.length <= 1) return;
    const timer = setInterval(() => {
      setFotoActivaIdx(prev => (prev + 1) % heroFotos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroFotos.length]);

  const sedeSeleccionada = sedes.find(s => s.nombre === formSede);
  const sedeSuspendida = estaSuspendida(sedeSeleccionada);
  const precioClaseSede = precioValido(preciosClaseModelo[formSede]);
  const tarifaClase = precioClaseSede === null ? 'Por consultar' : precioClaseSede === 0 ? 'Gratis' : mostrarPrecio(precioClaseSede);
  const esClaseGratis = precioClaseSede === 0;

  const mensajeWsPase = `¡Hola Campeones Lima! Deseo coordinar mi *Clase Modelo* desde la web oficial:%0A%0A` +
    `👤 *Alumno:* ${encodeURIComponent(formNombre)}%0A` +
    `🏆 *Deporte:* ${encodeURIComponent(formDeporte)}%0A` +
    `📍 *Sede:* ${encodeURIComponent(formSede)}%0A` +
    `🎂 *Categoría:* ${encodeURIComponent(formEdad)}%0A` +
    `💰 *Tarifa:* ${tarifaClase}%0A` +
    `📱 *WhatsApp:* ${encodeURIComponent(formTelefono)}%0A%0A` +
    `¿Cuáles son las fechas disponibles?`;

  const handleEnviarPaseCancha = async (e) => {
    e.preventDefault();
    if (!formNombre.trim() || !formTelefono.trim()) return alert("Ingresa tu nombre y WhatsApp.");

    if (cargandoDatos || errorConsulta || sedeSuspendida) return;
    if (!/^\+?[0-9 ()-]{9,20}$/.test(formTelefono.trim())) return setErrorFormulario('Ingresa un teléfono válido.');
    if (formNombre.trim().length < 2) return setErrorFormulario('Ingresa tu nombre completo.');
    setEnviandoForm(true);
    setErrorFormulario('');
    try {
      const { error } = await supabase.from('prospectos').insert([{
        nombre_alumno: formNombre.trim(),
        telefono_apoderado: formTelefono.trim(),
        sede: formSede || 'Por Coordinar',
        disciplina: formDeporte,
        edad: formEdad || '',
        estado: 'Pendiente',
        notas: 'Clase Modelo: ' + tarifaClase,
      }]);
      if (error) throw error;
      setFormEnviadoExito(true);
    } catch (error) {
      console.error(error);
      setErrorFormulario('No pudimos registrar tu solicitud. Tus datos siguen aquí; vuelve a intentarlo.');
    } finally { 
      setEnviandoForm(false); 
    }
  };

  const handleOtraReserva = () => {
    setFormNombre('');
    setFormTelefono('');
    setFormEnviadoExito(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
      esOscuro ? 'bg-[#040914] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {promocionActiva && (
        <div className="relative z-40 mt-20 bg-gradient-to-r from-[#F7B52C] via-[#ffc247] to-[#00B4A7] text-slate-950 px-4 py-2.5 text-center shadow-lg flex items-center justify-center gap-2 flex-wrap text-xs font-black">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <strong className="uppercase">¡Promo Temporal!</strong> {promocionActiva.titulo}
            {promocionActiva.valor_beneficio && (
              <span className="bg-slate-950 text-[#F7B52C] px-2.5 py-0.5 rounded-full text-[10px] ml-1 font-mono">
                {promocionActiva.valor_beneficio}
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={() => setMostrarModalFlyer(true)}
            className="bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase transition-transform active:scale-95 cursor-pointer ml-1 sm:ml-3 flex items-center gap-1 shadow"
          >
            <span>{promocionActiva.flyer_url ? 'Ver Flyer & Promo' : 'Ver Detalles'}</span>
            <ArrowRight className="w-3 h-3 text-[#F7B52C]" />
          </button>
        </div>
      )}

      <Navbar />
      {errorConsulta && <p role="alert" className="mt-24 p-4 bg-red-950 text-red-200">{errorConsulta}</p>}

      {mostrarModalFlyer && promocionActiva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-lg w-full bg-[#071527] border-2 border-[#F7B52C] rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-6 text-center space-y-4 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setMostrarModalFlyer(false)}
              className="absolute top-4 right-4 bg-slate-900/90 hover:bg-red-600 text-white rounded-full p-2 text-xs font-bold transition-colors cursor-pointer z-20 shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            {promocionActiva.flyer_url ? (
              <div className="rounded-2xl overflow-hidden max-h-[55vh] bg-black shadow-inner flex items-center justify-center">
                <img 
                  src={promocionActiva.flyer_url} 
                  alt={promocionActiva.titulo} 
                  className="w-full h-full object-contain max-h-[55vh]"
                />
              </div>
            ) : (
              <div className="p-8 bg-[#040914] rounded-2xl border border-slate-800 space-y-2">
                <Sparkles className="w-12 h-12 text-[#F7B52C] mx-auto" />
                <h3 className="text-xl font-black text-white">{promocionActiva.titulo}</h3>
                <p className="text-xs text-slate-300">{promocionActiva.descripcion}</p>
                <span className="inline-block font-mono font-black text-lg text-[#00B4A7] bg-[#00B4A7]/10 px-4 py-1.5 rounded-xl mt-2">
                  {promocionActiva.valor_beneficio}
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-center">
              <h3 className="text-lg font-black text-white">{promocionActiva.titulo}</h3>
              {promocionActiva.descripcion && (
                <p className="text-xs text-slate-300 px-2 leading-relaxed">{promocionActiva.descripcion}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                  `¡Hola Campeones Lima! Deseo reclamar la promoción: *${promocionActiva.titulo}* (${promocionActiva.valor_beneficio}). ¿Me brindan más información?`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>Reclamar por WhatsApp</span>
              </a>

              <a
                href="#ticket-cancha"
                onClick={() => setMostrarModalFlyer(false)}
                className="w-full sm:w-auto px-6 py-3 bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Ticket className="w-4 h-4 text-slate-950" />
                <span>Reservar Pase Cancha</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CABECERA HERO */}
      <header className="relative min-h-[92vh] lg:min-h-[96vh] flex items-center justify-center text-center px-4 sm:px-6 pt-28 sm:pt-36 pb-20 overflow-hidden z-10">
        {heroFotos.length > 0 && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroFotos.map((fotoItem, idx) => {
              const fotoUrl = typeof fotoItem === 'string' 
                ? fotoItem 
                : (fotoItem?.url || fotoItem?.imagen || fotoItem?.foto || fotoItem?.src || "");

              if (!fotoUrl) return null;

              const pos = bannerPosiciones[idx];
              const posX = typeof pos === 'object' && pos !== null ? (pos.x || 50) : 50;
              const posY = typeof pos === 'object' && pos !== null ? (pos.y || 50) : (Number(pos) || 50);

              return (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === fotoActivaIdx ? 'opacity-70 sm:opacity-75 scale-105' : 'opacity-0 scale-100'
                  }`}
                  style={{
                    backgroundImage: `url("${fotoUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${posX}% ${posY}%`,
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '1400ms'
                  }}
                />
              );
            })}
            <div className="absolute inset-0 bg-gradient-to-b from-[#040914]/65 via-[#040914]/60 to-[#040914]" />
          </div>
        )}

        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10 w-full">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-tight sm:leading-none text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            FORMAMOS <br />
            <span className="italic bg-gradient-to-r from-[#00B4A7] via-[#38bdf8] to-[#F7B52C] bg-clip-text text-transparent filter drop-shadow-[0_2px_15px_rgba(0,180,167,0.4)]">
              LÍDERES EN LA CANCHA
            </span> <br className="hidden sm:inline" />
            PARA TRIUNFAR EN LA VIDA
          </h1>

          <p className="text-xs sm:text-base lg:text-lg text-slate-100 max-w-2xl mx-auto font-bold leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)] px-2">
            Academia deportiva oficial de <strong className="text-[#F7B52C]">básquetbol</strong> y <strong className="text-[#00B4A7]">voleibol</strong> en coliseos techados. Desarrollo físico, disciplina técnica y valores desde los 6 años.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#071527]/90 border border-slate-700 text-[11px] font-bold text-white backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-[#00B4A7]" /> Coliseos 100% Techados
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#071527]/90 border border-slate-700 text-[11px] font-bold text-white backdrop-blur-md shadow-lg">
              <Award className="w-4 h-4 text-[#F7B52C]" /> Entrenadores Certificados
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#071527]/90 border border-slate-700 text-[11px] font-bold text-white backdrop-blur-md shadow-lg">
              <Users className="w-4 h-4 text-cyan-400" /> Formación por Edades
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto w-full px-2">
            <a
              href="#ticket-cancha"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F7B52C] to-[#e6a524] hover:from-[#ffc247] hover:to-[#F7B52C] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center text-center gap-2 shadow-2xl shadow-[#F7B52C]/30 transition-all transform active:scale-98 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="text-center leading-tight">Reclama tu clase de prueba</span>
            </a>

            <Link
              to="/sedes"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#071527]/95 hover:bg-slate-800 border border-slate-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center text-center gap-2 transition-colors cursor-pointer shadow-xl backdrop-blur-md"
            >
              <MapPin className="w-4 h-4 text-[#00B4A7]" />
              <span className="text-center leading-tight">Conocer Nuestras 6 Sedes</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MARCADOR LED */}
      <section className="border-y border-slate-800/80 bg-[#071527]/80 py-6 relative z-10 backdrop-blur-md shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[#040914]/80 border border-slate-800 shadow-md">
              <p className="text-3xl sm:text-4xl font-black text-[#F7B52C] font-mono tracking-tight">+11 Años</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">De Experiencia Oficial</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#040914]/80 border border-slate-800 shadow-md">
              <p className="text-3xl sm:text-4xl font-black text-[#00B4A7] font-mono tracking-tight">+4,000</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Atletas Formados</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#040914]/80 border border-slate-800 shadow-md">
              <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">+6,766</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Comunidad en Redes</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#040914]/80 border border-slate-800 shadow-md">
              <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">6 Sedes</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Coliseos Techados</p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCIPLINAS */}
      {disciplinas.length > 0 && (
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00B4A7] bg-[#00B4A7]/10 px-3 py-1 rounded-full border border-[#00B4A7]/30">
              Disciplinas Formativas
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white italic">
              Nuestras Disciplinas Oficiales
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {disciplinas.map((disc, idx) => {
              const tituloReal = disc.nombre || disc.titulo || `Disciplina ${idx + 1}`;
              const descReal = disc.descripcion || "";
              const fotoReal = disc.foto || disc.imagen || "";
              const posY = Number(disc.posicionY ?? 50);
              const posX = Number(disc.posicionX ?? 50);
              const esVoley = tituloReal.toLowerCase().includes('voley');

              return (
                <div 
                  key={idx} 
                  className={`rounded-3xl bg-[#071527] border-2 ${
                    esVoley ? 'border-[#00B4A7]/40 hover:border-[#00B4A7]' : 'border-[#F7B52C]/40 hover:border-[#F7B52C]'
                  } overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      {fotoReal ? (
                        <img 
                          src={fotoReal} 
                          alt={tituloReal} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ objectPosition: `${posX}% ${posY}%` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">
                          Foto en preparación
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071527] via-transparent to-black/40" />
                      
                      <span className={`absolute top-4 left-4 ${
                        esVoley ? 'bg-[#00B4A7]' : 'bg-[#F7B52C]'
                      } text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-lg uppercase`}>
                        {esVoley ? "🏐" : "🏀"} {tituloReal}
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
                        {tituloReal}
                      </h3>
                      {descReal && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {descReal}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 pt-0">
                    <Link 
                      to="/sedes" 
                      className={`w-full py-4 px-4 rounded-2xl ${
                        esVoley ? 'bg-[#00B4A7] hover:bg-[#00c9ba]' : 'bg-[#F7B52C] hover:bg-[#e6a524]'
                      } text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center text-center gap-2 shadow-lg transition-all`}
                    >
                      <span className="text-center leading-tight">
                        Ver Sedes y Horarios · {tituloReal}
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TICKET VIP */}
      <section id="ticket-cancha" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="rounded-3xl bg-[#071527] border-2 border-[#F7B52C]/60 shadow-2xl p-6 sm:p-10 relative overflow-hidden space-y-6">
          <div className="border-b-2 border-dashed border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F7B52C]/15 border border-[#F7B52C]/40 text-[10px] font-black text-[#F7B52C] uppercase tracking-wider mb-1.5">
                <Ticket className="w-3.5 h-3.5" /> Pase Oficial de Cancha
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white italic">
                Reserva tu Clase Modelo {`· ${tarifaClase}`}
              </h2>
            </div>

            <span className={`text-[10px] sm:text-xs font-mono font-black px-3.5 py-1.5 rounded-xl border self-start sm:self-auto ${
              esClaseGratis 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : 'bg-[#F7B52C]/15 text-[#F7B52C] border-[#F7B52C]/40'
            }`}>
              VALOR: {tarifaClase}
            </span>
          </div>

          {formEnviadoExito ? (
            <div className="p-6 bg-[#040914] rounded-2xl border border-emerald-500/50 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">¡Solicitud recibida!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Coordinaremos el horario para <strong>{formNombre}</strong> en <strong>{formSede}</strong> ({tarifaClase}).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${mensajeWsPase}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center text-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950 shrink-0" />
                  <span className="text-center">Confirmar Horario por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleOtraReserva}
                  className="w-full sm:w-auto inline-flex items-center justify-center text-center gap-2 px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-center">Hacer otra reserva</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEnviarPaseCancha} className="space-y-4 text-xs">
              {errorFormulario && <p role="alert" className="text-red-300">{errorFormulario}</p>}
              {cargandoDatos && <p role="status">Cargando tarifas…</p>}
              {sedeSuspendida && <p role="alert" className="text-amber-300 font-bold">⚠️ Las clases de esta sede están suspendidas temporalmente. Selecciona otra sede.</p>}
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre del Alumno / Apoderado *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mateo Gómez (o papá de Mateo)"
                    value={formNombre}
                    onChange={e => setFormNombre(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Número de WhatsApp *:</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 987654321"
                    value={formTelefono}
                    onChange={e => setFormTelefono(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Deporte de Interés:</label>
                  <select
                    value={formDeporte}
                    onChange={e => setFormDeporte(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 p-3 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="Básquetbol">🏀 Básquetbol</option>
                    <option value="Voleibol">🏐 Voleibol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sede:</label>
                  <select
                    value={formSede}
                    onChange={e => setFormSede(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 p-3 rounded-xl text-white font-bold cursor-pointer text-xs"
                  >
                    {sedes.map(s => {
                      const p = precioValido(preciosClaseModelo[s.nombre]);
                      const estaSusp = estaSuspendida(s);
                      return (
                        <option key={s.id} value={s.nombre} disabled={estaSusp}>
                          {s.nombre} ({p === 0 ? 'Gratis' : mostrarPrecio(p)}) {estaSusp ? ' - [SUSPENDIDA]' : ''}
                        </option>
                      );
                    })}
                    <option value="Por Coordinar">Quiero que me recomienden sede</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría / Edad:</label>
                  <select
                    value={formEdad}
                    onChange={e => setFormEdad(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 p-3 rounded-xl text-white font-bold cursor-pointer"
                  >
                    {categoriasEdades.map(c => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={enviandoForm || cargandoDatos || Boolean(errorConsulta) || sedeSuspendida}
                  className="w-full py-4 px-4 bg-gradient-to-r from-[#F7B52C] to-[#e6a524] hover:from-[#ffc247] hover:to-[#F7B52C] text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm rounded-xl flex items-center justify-center text-center gap-2 shadow-xl shadow-[#F7B52C]/20 transition-all cursor-pointer transform active:scale-98 disabled:opacity-50"
                >
                  {enviandoForm ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center text-center gap-2">
                      <Zap className="w-4 h-4 text-slate-950 fill-slate-950 shrink-0" />
                      <span className="text-center leading-snug">
                        {sedeSuspendida 
                          ? 'Sede Suspendida Temporalmente' 
                          : esClaseGratis 
                            ? 'Reclama tu clase de prueba' 
                            : `Solicitar clase de prueba · ${tarifaClase}`}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* CATÁLOGO DE SEDES */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-8 relative z-10 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-[#F7B52C] tracking-wider">
              Infraestructura Techada
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white italic">
              Nuestras 6 Sedes en Lima
            </h2>
          </div>
          <Link to="/sedes" className="text-xs font-bold text-[#00B4A7] hover:underline flex items-center gap-1 self-start sm:self-auto">
            <span>Ver fotos, canchas y mapa de todas las sedes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedes.slice(0, 3).map((s) => (
            <div key={s.id} className="bg-[#071527] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
              <div>
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img src={s.foto_principal || (s.imagenes && s.imagenes[0]) || ""} alt={s.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow">
                    📍 {s.distrito}
                  </span>

                  {estaSuspendida(s) && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded shadow flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Suspendida
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="font-black text-white text-base">{s.nombre}</h3>
                  <p className="text-xs text-slate-400 truncate">{s.direccion}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link to={`/sedes/${s.id}`} className="w-full py-2.5 px-4 rounded-xl bg-[#040914] hover:bg-[#00B4A7] hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center text-center gap-1.5 border border-slate-700 transition-colors">
                  <span className="text-center">Ver Horarios & Tarifas</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function EnrutadorConScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040914] grid place-items-center" role="status">Cargando…</div>}>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/sedes" element={<Sedes />} />
        <Route path="/sedes/:id" element={<SedeDetalle />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/trabaja" element={<TrabajaConNosotros />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <EnrutadorConScroll />
      </BrowserRouter>
    </ThemeProvider>
  );
}