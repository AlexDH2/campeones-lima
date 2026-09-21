import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  ExternalLink, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CreditCard, 
  Sparkles, 
  X, 
  Phone, 
  Clock, 
  Star, 
  Image as ImageIcon 
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ModalPago from './ModalPago';
import { normalizarPagos, precioValido, mostrarPrecio, whatsappNumero, estaSuspendida } from './domain';
import { useSedeDetalle } from './queries';

export default function SedeDetalle() {
  const { id } = useParams();
  const { data, isLoading: cargando, isError } = useSedeDetalle(id);

  const sede = data?.sede || null;
  const precioClaseConfig = data?.preciosClaseModelo;
  const metodosPagoConfig = data?.metodosPago;
  const todasLasPromociones = data?.promociones || [];
  const bannerPromocionesSedes = data?.banners;

  const [indiceActual, setIndiceActual] = useState(0);
  const [filtroDeporte, setFiltroDeporte] = useState('TODOS');
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [modalPromosAbierto, setModalPromosAbierto] = useState(false);

  const precioClaseModelo = useMemo(() => {
    if (!sede || !precioClaseConfig || typeof precioClaseConfig !== 'object') return null;
    return precioValido(precioClaseConfig[sede.nombre]);
  }, [sede, precioClaseConfig]);

  const datosPagoSede = useMemo(() => {
    if (!sede || !metodosPagoConfig || typeof metodosPagoConfig !== 'object') return null;
    const infoSede = metodosPagoConfig[sede.nombre];
    return infoSede ? normalizarPagos(infoSede) : null;
  }, [sede, metodosPagoConfig]);

  const bannerPromocionalSede = useMemo(() => {
    if (!sede || !bannerPromocionesSedes || typeof bannerPromocionesSedes !== 'object') return null;
    const b = bannerPromocionesSedes[sede.nombre];
    return (b && b.activo !== false && b.flyer_url) ? b.flyer_url : null;
  }, [sede, bannerPromocionesSedes]);

  const promocionesDeEstaSede = useMemo(() => {
    if (!sede?.nombre || !Array.isArray(todasLasPromociones)) return [];
    const nombreLimpio = sede.nombre.toLowerCase().replace(/sede\s*/gi, '').trim();

    return todasLasPromociones.filter((p) => {
      if (p.visible_en_web === false) return false;
      const campoSede = (p.sede || p.sedes || '').toLowerCase().trim();
      const titulo = (p.titulo || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();

      if (campoSede && (campoSede.includes(nombreLimpio) || nombreLimpio.includes(campoSede))) return true;
      if (titulo.includes(nombreLimpio)) return true;
      if (descripcion.includes(nombreLimpio)) return true;
      if (campoSede.includes('todas') || campoSede === 'general') {
        const tieneOtraSede = titulo.includes(' - ') && !titulo.includes(nombreLimpio);
        return !tieneOtraSede;
      }
      return false;
    });
  }, [sede?.nombre, todasLasPromociones]);

  const fotos = useMemo(() => {
    if (!sede) return [];
    let list = [];
    if (Array.isArray(sede.imagenes) && sede.imagenes.length > 0) {
      list = sede.imagenes;
    } else if (typeof sede.imagenes === 'string') {
      try {
        const parsed = JSON.parse(sede.imagenes);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch { /* fallback */ }
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

  if (!sede || isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040914] text-white space-y-4 p-4">
        <h2 className="text-2xl font-black">Sede no encontrada o no disponible</h2>
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
    const texto = `¡Hola Campeones Lima! Deseo inscribirme en el *${promoNombre}* para la sede *${sede.nombre}*:%0A%0A` +
      `🏆 *Deporte:* ${encodeURIComponent(turno.deporte)} (${encodeURIComponent(turno.categoria)})%0A` +
      `📅 *Días:* ${encodeURIComponent(turno.dias)}%0A` +
      `⏰ *Horario:* ${encodeURIComponent(turno.horaInicio)} - ${encodeURIComponent(turno.horaFin)}%0A` +
      (monto !== undefined && monto !== null && monto !== '' ? `💰 *Inversión:* ${mostrarPrecio(monto)}%0A` : '') +
      `¿Cuáles son las formas de pago de la matrícula/reserva?`;
    return `https://wa.me/${numeroWhatsappSede}?text=${texto}`;
  };

  const crearLinkWsTarjetaPromo = (promo) => {
    const texto = `¡Hola Campeones Lima! Deseo reclamar la siguiente promoción en la sede *${sede.nombre}*:%0A%0A` +
      `🔥 *Promoción:* ${encodeURIComponent(promo.titulo)}%0A` +
      (promo.valor_beneficio ? `💰 *Inversión:* ${encodeURIComponent(promo.valor_beneficio)}%0A` : '') +
      (promo.descripcion ? `📋 *Detalle:* ${encodeURIComponent(promo.descripcion)}%0A` : '') +
      `%0A¿Cuáles son los pasos para realizar la inscripción con esta promo?`;
    return `https://wa.me/${numeroWhatsappSede}?text=${texto}`;
  };

  const enlaceMapa = sede.maps || sede.mapa || sede.mapa_url || '';
  const flyerDeLaSede = bannerPromocionalSede || promocionesDeEstaSede.find(p => p.flyer_url)?.flyer_url || null;

  return (
    <div className="min-h-screen font-sans bg-[#040914] text-slate-100 relative overflow-hidden">
      <Navbar />

      <ModalPago
        abierto={modalPagoAbierto}
        alCerrar={() => setModalPagoAbierto(false)}
        datosPago={datosPagoSede}
        nombreSede={sede.nombre}
        telefonoContacto={numeroWhatsappSede}
      />

      {modalPromosAbierto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in select-none"
          onClick={(e) => { if (e.target === e.currentTarget) setModalPromosAbierto(false); }}
        >
          <div className="bg-[#071527] border-2 border-[#F7B52C] w-full max-w-5xl rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl max-h-[94vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F7B52C]/15 text-[#F7B52C]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase italic tracking-wide">
                    PROMOCIONES OFICIALES DE TEMPORADA
                  </h3>
                  <p className="text-xs text-slate-400">
                    Packs especiales y campañas vigentes para la sede <strong className="text-[#F7B52C]">{sede.nombre}</strong>
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setModalPromosAbierto(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden flex-1 min-h-0">
              <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-black/70 border-2 border-[#F7B52C]/40 p-2 overflow-hidden shadow-inner">
                {flyerDeLaSede ? (
                  <img
                    src={flyerDeLaSede}
                    alt={`Flyer Promocional ${sede.nombre}`}
                    className="w-full h-auto max-h-[45vh] lg:max-h-[65vh] object-contain rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3 text-slate-500">
                    <ImageIcon className="w-12 h-12 text-[#F7B52C] mx-auto opacity-70" />
                    <p className="text-xs font-black text-white uppercase">Campaña Oficial {sede.nombre}</p>
                    <p className="text-[11px] text-slate-400">
                      Consulta los precios y paquetes disponibles en el panel lateral.
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 flex flex-col overflow-y-auto space-y-3 pr-1">
                {promocionesDeEstaSede.length === 0 ? (
                  <div className="p-8 text-center bg-[#040914] rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs space-y-2 my-auto">
                    <Tag className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="font-bold text-white text-sm">No hay promociones activas para la sede {sede.nombre} en este momento.</p>
                    <p className="text-slate-500">Consulta nuestras tarifas regulares mensuales directamente con nosotros.</p>
                  </div>
                ) : (
                  promocionesDeEstaSede.map((promo) => (
                    <div 
                      key={promo.id} 
                      className="p-4 rounded-2xl bg-[#040914] border-2 border-slate-800 hover:border-[#F7B52C]/70 transition-all flex flex-col sm:flex-row gap-3.5 justify-between items-start sm:items-center shadow-lg"
                    >
                      <div className="space-y-1.5 flex-1 pr-2 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide">
                            {promo.titulo}
                          </h4>
                          {promo.valor_beneficio && (
                            <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded bg-[#F7B52C] text-slate-950 shadow-sm">
                              {promo.valor_beneficio}
                            </span>
                          )}
                        </div>

                        {promo.descripcion && (
                          <p className="text-xs text-slate-300 leading-relaxed">{promo.descripcion}</p>
                        )}

                        <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                          <span className="text-[#00B4A7] flex items-center gap-1 font-bold">
                            <Star className="w-3 h-3 fill-current" /> Campaña Oficial
                          </span>
                          {promo.valido_hasta && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Hasta: {promo.valido_hasta}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={crearLinkWsTarjetaPromo(promo)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F7B52C] hover:bg-[#ffc247] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#F7B52C]/25 transition-all transform hover:scale-105 shrink-0 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 fill-slate-950" />
                        <span>RECLAMAR PROMO</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setModalPromosAbierto(false)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETORNO */}
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
        <section className="border-2 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[#071527] to-[#050e1c] border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-6 border-slate-800/80">
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

              <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tight text-white">
                {sede.nombre}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
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

            {/* CLASE MODELO */}
            <div className="w-full lg:w-auto border rounded-2xl p-4 sm:px-6 sm:py-4 shadow-xl flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 bg-[#040914]/90 border-slate-800">
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

        {/* HORARIOS Y TARIFAS */}
        <section className="border-2 border-[#F7B52C]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl bg-[#071527]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7B52C]/15 border border-[#F7B52C]/30 text-[#F7B52C] text-xs font-black uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5" /> Temporada 2026
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight text-white">
                Tarifas, Planes & Horarios
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

          {(promocionesDeEstaSede.length > 0 || flyerDeLaSede) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F7B52C]/15 via-[#00B4A7]/15 to-[#040914] border border-[#F7B52C]/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3 text-left">
                <div className="p-3 rounded-2xl bg-[#F7B52C] text-slate-950 font-black shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Revisa el flyer oficial de temporada, uniformes y paquetes de 3 meses.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalPromosAbierto(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#F7B52C]/25 transition-all transform hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Ver Promociones de esta Sede</span>
              </button>
            </div>
          )}

          {/* MATRIZ DE HORARIOS */}
          <div className="space-y-4">
            {horariosFiltrados.map((t, idx) => {
              const esVoley = t.deporte?.toLowerCase().includes('voley');
              const tieneX2 = precioValido(t.precio_x2) > 0;
              const tieneX2U = precioValido(t.precio_x2_u) > 0;

              return (
                <div 
                  key={idx} 
                  className="p-5 sm:p-6 rounded-2xl border-2 transition-all space-y-4 bg-[#040914] border-slate-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          esVoley ? 'bg-[#00B4A7]/20 text-[#00B4A7]' : 'bg-[#F7B52C]/20 text-[#F7B52C]'
                        }`}>
                          {t.deporte || 'Básquetbol'}
                        </span>
                        <strong className="text-base sm:text-lg text-white">{t.categoria}</strong>
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

                  {/* MATRIZ REGULAR */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1 MES REGULAR */}
                    <div className="p-3.5 rounded-xl border text-center flex flex-col justify-between bg-[#071527] border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">1 Mes Regular</span>
                        <span className="text-xl font-black font-mono text-white">{mostrarPrecio(t.precio_mes)}</span>
                      </div>
                      <a
                        href={suspendida ? undefined : crearLinkWsPromo(t, "Plan 1 Mes", t.precio_mes)}
                        aria-disabled={suspendida}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 py-1.5 px-3 rounded-lg bg-[#00B4A7] text-slate-950 text-xs font-bold block"
                      >
                        Inscribirme
                      </a>
                    </div>

                    {/* PROMO X2 */}
                    {tieneX2 && (
                      <div className="p-3.5 rounded-xl border border-[#F7B52C]/40 text-center flex flex-col justify-between bg-[#071527]">
                        <div>
                          <span className="text-[10px] font-bold text-[#F7B52C] uppercase block">Promo X2 (2 Meses)</span>
                          <span className="text-xl font-black font-mono text-[#F7B52C]">{mostrarPrecio(t.precio_x2)}</span>
                        </div>
                        <a
                          href={suspendida ? undefined : crearLinkWsPromo(t, "Promo X2", t.precio_x2)}
                          aria-disabled={suspendida}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2.5 py-1.5 px-3 rounded-lg bg-[#F7B52C] text-slate-950 text-xs font-black block"
                        >
                          Elegir X2
                        </a>
                      </div>
                    )}

                    {/* X2 + UNIFORME */}
                    {tieneX2U && (
                      <div className="p-3.5 rounded-xl border border-[#00B4A7]/50 text-center flex flex-col justify-between bg-[#071527]">
                        <div>
                          <span className="text-[10px] font-bold text-[#00B4A7] uppercase block">X2 + Uniforme</span>
                          <span className="text-xl font-black font-mono text-[#00B4A7]">{mostrarPrecio(t.precio_x2_u)}</span>
                        </div>
                        <a
                          href={suspendida ? undefined : crearLinkWsPromo(t, "Promo X2 + Uniforme", t.precio_x2_u)}
                          aria-disabled={suspendida}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2.5 py-1.5 px-3 rounded-lg bg-[#00B4A7] text-slate-950 text-xs font-black block"
                        >
                          Elegir X2 + U
                        </a>
                      </div>
                    )}
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