import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  ArrowLeft, 
  MessageCircle, 
  Loader2, 
  ExternalLink, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CreditCard 
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ModalPago from './ModalPago';
import { useTheme } from './ThemeContext';
import { supabase } from './supabase';
import { normalizarPagos, precioValido, mostrarPrecio, whatsappNumero, estaSuspendida } from './domain';

export default function SedeDetalle() {
  const { id } = useParams();
  const { esOscuro = true } = useTheme();

  const [errorConsulta, setErrorConsulta] = useState('');
  const [sede, setSede] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [indiceActual, setIndiceActual] = useState(0);
  const [filtroDeporte, setFiltroDeporte] = useState('TODOS');
  const [precioClaseModelo, setPrecioClaseModelo] = useState(null);

  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [datosPagoSede, setDatosPagoSede] = useState(null);

  useEffect(() => {
    let activo = true;
    async function cargarDetalleSede() {
      setCargando(true);
      setSede(null);
      setErrorConsulta('');
      setDatosPagoSede(null);
      setPrecioClaseModelo(null);
      setIndiceActual(0);
      setFiltroDeporte('TODOS');
      try {
        const [resSede, resConfig, resPagos] = await Promise.all([
          supabase.from('sedes').select('*').eq('id', id).maybeSingle(),
          supabase.from('configuracion_web').select('valor').eq('clave', 'precios_clase_modelo').maybeSingle(),
          supabase.from('configuracion_web').select('valor').eq('clave', 'metodos_pago_sedes').maybeSingle()
        ]);

        if (!activo) return;
        if (resSede.error) throw resSede.error;
        if (resConfig.error) console.error('No se pudieron cargar los precios:', resConfig.error);
        if (resPagos.error) console.error('No se pudieron cargar los pagos:', resPagos.error);
        if (resSede.data) {
          const s = resSede.data;
          setSede(s);

          if (resConfig.data?.valor && typeof resConfig.data.valor === 'object') {
            const precio = precioValido(resConfig.data.valor[s.nombre]);
            setPrecioClaseModelo(precio);
          }

          if (resPagos.data?.valor && typeof resPagos.data.valor === 'object') {
            const infoSede = resPagos.data.valor[s.nombre];
            if (infoSede) {
              setDatosPagoSede(normalizarPagos(infoSede));
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar sede:", err);
        if (activo) setErrorConsulta("No se pudo cargar la sede. Recarga para reintentar.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargarDetalleSede();
    return () => { activo = false; };
  }, [id]);

  const fotos = useMemo(() => {
    if (!sede) return [];
    let list = [];

    if (Array.isArray(sede.imagenes) && sede.imagenes.length > 0) {
      list = sede.imagenes;
    } else if (typeof sede.imagenes === 'string') {
      try {
        const parsed = JSON.parse(sede.imagenes);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch { /* Usar foto principal */ }
    }

    if (list.length === 0 && sede.foto_principal) {
      list = [sede.foto_principal];
    }

    return list;
  }, [sede]);

  useEffect(() => {
    if (fotos.length <= 1) return;

    const temporizador = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % fotos.length);
    }, 3500);

    return () => clearInterval(temporizador);
  }, [fotos]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040914]">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin" />
      </div>
    );
  }

  if (!sede) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040914] text-white space-y-4 p-4">
        <h2 className="text-2xl font-black">{errorConsulta || 'Sede no encontrada'}</h2>
        <Link to="/sedes" className="text-xs text-[#00B4A7] font-bold underline">
          Volver al listado de sedes
        </Link>
      </div>
    );
  }

  const numeroWhatsappSede = whatsappNumero(sede.telefono_contacto);
  const suspendida = estaSuspendida(sede);

  const horariosTodos = Array.isArray(sede.horarios) ? sede.horarios : [];
  const deportesDisponibles = Array.from(new Set(horariosTodos.map(h => h.deporte).filter(Boolean)));

  const horariosFiltrados = filtroDeporte === 'TODOS'
    ? horariosTodos
    : horariosTodos.filter(h => h.deporte === filtroDeporte);

  const esGratis = precioClaseModelo === 0;

  const anteriorFoto = (e) => {
    e?.stopPropagation();
    setIndiceActual((prev) => (prev <= 0 ? fotos.length - 1 : prev - 1));
  };

  const siguienteFoto = (e) => {
    e?.stopPropagation();
    setIndiceActual((prev) => (prev + 1) % fotos.length);
  };

  const linkClasePrueba = `https://wa.me/${numeroWhatsappSede}?text=${encodeURIComponent(
    `¡Hola Campeones Lima! Deseo reservar una *Clase de Prueba* (${esGratis ? 'Gratis' : mostrarPrecio(precioClaseModelo)}) en la sede *${sede.nombre}*. ¿Cuáles son los horarios disponibles para empezar?`
  )}`;

  const crearLinkWsPromo = (turno, promoNombre, monto) => {
    const texto = `¡Hola Campeones Lima! Deseo inscribirme en la *${promoNombre}* para la sede *${sede.nombre}*:%0A%0A` +
      `🏆 *Deporte:* ${encodeURIComponent(turno.deporte)} (${encodeURIComponent(turno.categoria)})%0A` +
      `📅 *Días:* ${encodeURIComponent(turno.dias)}%0A` +
      `⏰ *Horario:* ${encodeURIComponent(turno.horaInicio)} - ${encodeURIComponent(turno.horaFin)}%0A` +
      `💰 *Inversión:* ${encodeURIComponent(mostrarPrecio(monto))}%0A%0A` +
      `¿Cuáles son las formas de pago de la matrícula/reserva?`;
    return `https://wa.me/${numeroWhatsappSede}?text=${texto}`;
  };

  const enlaceMapa = sede.maps || sede.mapa || sede.mapa_url || '';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
      esOscuro ? 'bg-[#040914] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <ModalPago
        abierto={modalPagoAbierto}
        alCerrar={() => setModalPagoAbierto(false)}
        datosPago={datosPagoSede}
        nombreSede={sede.nombre}
        telefonoContacto={numeroWhatsappSede}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-4 relative z-10">
        <Link to="/sedes" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00B4A7] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Sedes</span>
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-12 relative z-10">
        
        {suspendida && (
          <p role="status" className="p-4 rounded-xl bg-amber-950 text-amber-200 border border-amber-800 font-bold">
            ⚠️ Clases suspendidas temporalmente en esta sede. {sede.motivo_suspension || 'Consulta con nosotros antes de reservar.'}
          </p>
        )}

        {/* CABECERA Y CARRUSEL */}
        <section className={`border-2 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 ${
          esOscuro ? 'bg-gradient-to-b from-[#071527] to-[#050e1c] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-6 ${
            esOscuro ? 'border-slate-800/80' : 'border-slate-200'
          }`}>
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#00B4A7] bg-[#00B4A7]/10 px-3 py-1 rounded-full border border-[#00B4A7]/30 flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-[#00B4A7]" />
                  {sede.distrito || 'LIMA'} · Coliseo Techado
                </span>

                {(sede.disciplinas || ['Básquetbol', 'Voleibol']).map((dep, idx) => (
                  <span key={idx} className="text-xs font-bold px-3 py-1 rounded-full bg-[#040914] text-[#F7B52C] border border-[#F7B52C]/30 flex items-center gap-1">
                    <span>{dep.toLowerCase().includes('voley') ? '🏐' : '🏀'}</span>
                    <span>{dep}</span>
                  </span>
                ))}
              </div>

              <h1 className={`text-3xl sm:text-5xl font-black uppercase italic tracking-tight ${
                esOscuro ? 'text-white' : 'text-slate-900'
              }`}>
                {sede.nombre}
              </h1>

              <div className={`flex flex-wrap items-center gap-3 text-xs sm:text-sm ${
                esOscuro ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <span>{sede.direccion} {sede.referencia && `(${sede.referencia})`}</span>
                
                {enlaceMapa && (
                  <a
                    href={enlaceMapa}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#040914] hover:bg-slate-800 text-[#00B4A7] border border-slate-700 text-xs font-bold transition-all"
                  >
                    <span>🗺️ Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setModalPagoAbierto(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#071527] hover:bg-slate-800 text-[#F7B52C] border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Ver Métodos de Pago</span>
                </button>
              </div>
            </div>

            {/* Tarjeta de Acción */}
            <div className={`w-full lg:w-auto border rounded-2xl p-4 sm:px-6 sm:py-4 shadow-xl flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 ${
              esOscuro ? 'bg-[#040914]/90 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="text-left lg:text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Clase Modelo
                </span>
                <span className={`text-base sm:text-lg font-black font-mono inline-block mt-0.5 ${
                  esGratis ? 'text-emerald-400' : 'text-[#F7B52C]'
                }`}>
                  {esGratis ? '¡TOTALMENTE GRATIS!' : mostrarPrecio(precioClaseModelo)}
                </span>
              </div>

              <a
                href={suspendida ? undefined : linkClasePrueba}
                aria-disabled={suspendida}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all whitespace-nowrap ${
                  suspendida
                    ? 'bg-slate-600 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-[#00B4A7] to-teal-400 hover:from-[#00c9ba] hover:to-teal-300 shadow-[#00B4A7]/25 cursor-pointer hover:-translate-y-0.5'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{suspendida ? 'Clases suspendidas' : 'Reservar Clase'}</span>
              </a>
            </div>

          </div>

          {/* CARRUSEL DE FOTOS */}
          <div className="relative w-full aspect-[16/9] max-h-[480px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
            {fotos.length > 0 ? (
              fotos.map((url, i) => {
                const pos = sede.posiciones_fotos?.[url];
                const pX = typeof pos === 'object' && pos !== null ? (pos.x ?? 50) : 50;
                const pY = typeof pos === 'object' && pos !== null ? (pos.y ?? 50) : (Number(pos) || 50);

                const esActiva = i === indiceActual;
                const estiloTransformacion = esActiva
                  ? 'translate-x-0 opacity-100 z-10 scale-100'
                  : i < indiceActual
                    ? '-translate-x-full opacity-0 z-0 scale-95'
                    : 'translate-x-full opacity-0 z-0 scale-95';

                return (
                  <div
                    key={i}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${estiloTransformacion}`}
                  >
                    <img
                      src={url}
                      alt={`Instalación ${i + 1} de ${sede.nombre}`}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${pX}% ${pY}%` }}
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                Foto de cancha en preparación
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#050e1c] via-transparent to-black/25 pointer-events-none z-20" />

            {fotos.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20 shadow-md z-30">
                📷 {indiceActual + 1} / {fotos.length}
              </div>
            )}

            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={anteriorFoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-[#00B4A7] text-white hover:text-slate-950 backdrop-blur-md border border-white/15 transition-all shadow-lg cursor-pointer z-30"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={siguienteFoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-[#00B4A7] text-white hover:text-slate-950 backdrop-blur-md border border-white/15 transition-all shadow-lg cursor-pointer z-30"
                  aria-label="Siguiente foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </section>

        {/* SECCIÓN DE PROMOCIONES Y TARIFAS */}
        <section className={`border-2 border-[#F7B52C]/50 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl ${
          esOscuro ? 'bg-[#071527]' : 'bg-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7B52C]/15 border border-[#F7B52C]/30 text-[#F7B52C] text-xs font-black uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5" /> Temporada 2026
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black uppercase italic tracking-tight ${
                esOscuro ? 'text-white' : 'text-slate-900'
              }`}>
                Tarifas, Planes & Promociones
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroDeporte('TODOS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                  filtroDeporte === 'TODOS'
                    ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow'
                    : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Todos ({horariosTodos.length})
              </button>

              {deportesDisponibles.map((dep, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFiltroDeporte(dep)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                    filtroDeporte === dep
                      ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow'
                      : 'bg-[#040914] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {dep}
                </button>
              ))}
            </div>
          </div>

          {/* MATRIZ DE HORARIOS */}
          <div className="space-y-4">
            {horariosFiltrados.map((t, idx) => {
              const esVoley = t.deporte?.toLowerCase().includes('voley');

              return (
                <div 
                  key={idx} 
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all space-y-4 ${
                    esOscuro ? 'bg-[#040914] border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          esVoley ? 'bg-[#00B4A7]/20 text-[#00B4A7]' : 'bg-[#F7B52C]/20 text-[#F7B52C]'
                        }`}>
                          {t.deporte || 'Básquetbol'}
                        </span>
                        <strong className={`text-base sm:text-lg ${esOscuro ? 'text-white' : 'text-slate-900'}`}>{t.categoria}</strong>
                      </div>
                      <p className="text-slate-400 text-xs font-medium">
                        🗓️ {t.dias} · ⏰ <span className="font-mono font-bold">{t.horaInicio} - {t.horaFin}</span>
                      </p>
                    </div>

                    {precioValido(t.precio_clase) !== null && (
                      <div className="self-start sm:self-auto">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold text-right">Clase:</span>
                        <span className="font-mono text-sm font-black text-[#00B4A7]">{mostrarPrecio(t.precio_clase)}</span>
                      </div>
                    )}
                  </div>

                  {/* MATRIZ DE PRECIOS */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                      esOscuro ? 'bg-[#071527] border-slate-800' : 'bg-white border-slate-300'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">1 Mes</span>
                        <span className={`text-lg font-black font-mono ${esOscuro ? 'text-white' : 'text-slate-900'}`}>{mostrarPrecio(t.precio_mes)}</span>
                      </div>
                      <a
                        href={suspendida ? undefined : crearLinkWsPromo(t, "Plan 1 Mes", t.precio_mes)}
                        aria-disabled={suspendida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 py-1 px-2 rounded-lg bg-[#00B4A7] text-slate-950 text-[10px] font-bold block"
                      >
                        Inscribirme
                      </a>
                    </div>

                    <div className={`p-3 rounded-xl border border-[#F7B52C]/40 text-center flex flex-col justify-between ${
                      esOscuro ? 'bg-[#071527]' : 'bg-white'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold text-[#F7B52C] uppercase block">Promo X2</span>
                        <span className="text-lg font-black font-mono text-[#F7B52C]">{mostrarPrecio(t.precio_x2)}</span>
                      </div>
                      <a
                        href={suspendida ? undefined : crearLinkWsPromo(t, "Promo X2", t.precio_x2)}
                        aria-disabled={suspendida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 py-1 px-2 rounded-lg bg-[#F7B52C] text-slate-950 text-[10px] font-black block"
                      >
                        Elegir X2
                      </a>
                    </div>

                    <div className={`p-3 rounded-xl border border-[#00B4A7]/50 text-center flex flex-col justify-between ${
                      esOscuro ? 'bg-[#071527]' : 'bg-white'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold text-[#00B4A7] uppercase block">X2 + Uniforme</span>
                        <span className="text-lg font-black font-mono text-[#00B4A7]">{mostrarPrecio(t.precio_x2_u)}</span>
                      </div>
                      <a
                        href={suspendida ? undefined : crearLinkWsPromo(t, "Promo X2 + Uniforme", t.precio_x2_u)}
                        aria-disabled={suspendida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 py-1 px-2 rounded-lg bg-[#00B4A7] text-slate-950 text-[10px] font-black block"
                      >
                        Elegir X2 + U
                      </a>
                    </div>

                    <div className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                      esOscuro ? 'bg-[#071527] border-slate-800' : 'bg-white border-slate-300'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Promo X3</span>
                        <span className={`text-lg font-black font-mono ${esOscuro ? 'text-white' : 'text-slate-900'}`}>{mostrarPrecio(t.precio_x3)}</span>
                      </div>
                      <a
                        href={suspendida ? undefined : crearLinkWsPromo(t, "Promo X3", t.precio_x3)}
                        aria-disabled={suspendida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 py-1 px-2 rounded-lg bg-slate-700 text-white text-[10px] font-bold block"
                      >
                        Elegir X3
                      </a>
                    </div>

                    <div className={`p-3 rounded-xl border border-emerald-500/50 text-center flex flex-col justify-between col-span-2 sm:col-span-1 ${
                      esOscuro ? 'bg-[#071527]' : 'bg-white'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase block">X3 + Uniforme</span>
                        <span className="text-lg font-black font-mono text-emerald-500">{mostrarPrecio(t.precio_x3_u)}</span>
                      </div>
                      <a
                        href={suspendida ? undefined : crearLinkWsPromo(t, "Promo X3 + Uniforme", t.precio_x3_u)}
                        aria-disabled={suspendida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 py-1 px-2 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black block"
                      >
                        Elegir Pack
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}