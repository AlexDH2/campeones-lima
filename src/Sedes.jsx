import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  Filter, 
  ShieldCheck, 
  Navigation,
  Bus,
  Layers,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from './supabase';

// Componente Carrusel para las fotos de cada sede (cambio automático cada 4s)
function SedeImageSlider({ imagenes, nombreSede }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!imagenes || imagenes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [imagenes]);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imagenes.length);
  };

  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div className="relative w-full h-56 sm:h-64 bg-[#060d19] rounded-2xl overflow-hidden mb-5 border border-teal-950 group">
      <img 
        src={imagenes[currentIndex]} 
        alt={`${nombreSede} - foto ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=60";
        }}
      />

      {/* Flechas de navegación (si tiene más de 1 foto) */}
      {imagenes.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/70 hover:bg-teal-500 hover:text-slate-950 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/70 hover:bg-teal-500 hover:text-slate-950 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicadores de puntos inferiores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {imagenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'bg-teal-400 w-4' : 'bg-slate-500'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SedesPage() {
  const WHATSAPP_PHONE = "51963896985";
  const [distritoFiltro, setDistritoFiltro] = useState('todos');
  const [deporteFiltro, setDeporteFiltro] = useState('todos');
  const [sedesData, setSedesData] = useState([]);
  const [cargando, setCargando] = useState(true);

  const location = useLocation();
  const vieneDeAdmin = new URLSearchParams(location.search).get('from') === 'admin';

  useEffect(() => {
    async function cargarSedes() {
      try {
        const { data, error } = await supabase
          .from('sedes')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          setSedesData(data);
        }
      } catch (err) {
        console.error("Error al cargar sedes:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarSedes();
  }, []);

  const sedesFiltradas = sedesData.filter((sede) => {
    const coincideDistrito = distritoFiltro === 'todos' || sede.distrito.toLowerCase().includes(distritoFiltro.toLowerCase());
    const coincideDeporte = deporteFiltro === 'todos' || (sede.disciplinas && sede.disciplinas.some(d => d.toLowerCase().includes(deporteFiltro.toLowerCase())));
    return coincideDistrito && coincideDeporte;
  });

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950">
      
      {vieneDeAdmin && (
        <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-amber-500 via-teal-500 to-cyan-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Modo Previsualización: Sedes en vivo
          </div>
          <Link 
            to="/admin" 
            className="bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel de Admin
          </Link>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`fixed left-0 w-full z-40 bg-[#060d19]/90 backdrop-blur-md border-b border-teal-950/60 transition-all ${vieneDeAdmin ? 'top-8' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-11 h-11 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-white">CAMPEONES <span className="text-amber-400">LIMA</span></span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Club & Academia Deportiva</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-teal-400 transition-colors">Inicio</Link>
            <Link to="/nosotros" className="hover:text-teal-400 transition-colors">Nosotros</Link>
            <Link to="/sedes" className="text-teal-400 font-bold">Sedes</Link>
            <Link to="/eventos" className="hover:text-teal-400 transition-colors">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400 transition-colors">Tienda</Link>
            <Link to="/trabaja" className="hover:text-teal-400 transition-colors">Trabaja con Nosotros</Link>
          </div>

          <a 
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20deseo%20consultar%20vacantes%20en%20sus%20sedes`}
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm"
          >
            Clase de Prueba
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className={`pb-16 text-center ${vieneDeAdmin ? 'pt-44' : 'pt-36'}`}>
        <h1 className="text-4xl sm:text-6xl font-black text-white">Nuestras <span className="text-teal-300">Sedes y Horarios</span></h1>
        <p className="mt-4 text-slate-300 text-sm">Entrenamientos en coliseos cerrados y complejos de primer nivel en Lima.</p>
      </section>

      {/* LISTADO DE SEDES */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Cargando sedes...</p>
            </div>
          ) : sedesFiltradas.length === 0 ? (
            <div className="text-center py-20 bg-[#081322] border border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
              <MapPin className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Próximamente nuevas sedes</h3>
              <p className="text-xs text-slate-400 mb-6">Estamos actualizando los horarios y sedes de la temporada.</p>
              <a 
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20consultar%20por%20sedes%20cercanas`}
                target="_blank"
                rel="noreferrer"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Consultar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="space-y-12">
              {sedesFiltradas.map((sede) => (
                <div key={sede.id} className="bg-[#081322] border border-teal-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
                  
                  {/* CARRUSEL DE FOTOS DE LA SEDE (SI TIENE IMÁGENES CARGADAS) */}
                  {sede.imagenes && sede.imagenes.length > 0 && (
                    <SedeImageSlider imagenes={sede.imagenes} nombreSede={sede.nombre} />
                  )}

                  <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        <MapPin className="w-3.5 h-3.5" /> {sede.distrito}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{sede.nombre}</h2>
                      <p className="text-xs sm:text-sm text-slate-300 font-semibold">{sede.direccion}</p>
                      {sede.referencia && <p className="text-xs text-slate-400">{sede.referencia}</p>}

                      {sede.disciplinas && sede.disciplinas.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-bold uppercase text-slate-400 mb-2">Disciplinas:</p>
                          <div className="flex flex-wrap gap-2">
                            {sede.disciplinas.map((d, i) => (
                              <span key={i} className="text-xs font-bold px-3 py-1 rounded-lg bg-[#0d1f36] text-teal-300 border border-teal-900/60">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {sede.instalaciones && (
                        <div className="pt-2">
                          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Instalaciones:</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{sede.instalaciones}</p>
                        </div>
                      )}

                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        <a 
                          href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20deseo%20inscribirme%20en%20la%20${encodeURIComponent(sede.nombre)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs"
                        >
                          Inscribirme en esta Sede
                        </a>
                        {sede.maps && (
                          <a href={sede.maps} target="_blank" rel="noreferrer" className="bg-[#0a182b] text-slate-200 font-bold px-4 py-3 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5">
                            Ver Maps <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#0a182b]/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-white font-bold text-xs uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-amber-400" /> Horarios de Entrenamiento
                      </div>
                      {sede.horarios && sede.horarios.length > 0 ? (
                        sede.horarios.map((h, idx) => (
                          <div key={idx} className="bg-[#060d19] p-3 rounded-xl border border-teal-950/60">
                            <p className="text-xs font-bold text-amber-300">{h.dias} — <span className="text-teal-300">{h.horas}</span></p>
                            <p className="text-xs text-slate-300 mt-0.5">{h.grupo}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-2">Horarios en coordinación.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#03060c] border-t border-teal-950/60 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-black text-white text-sm">CAMPEONES LIMA</p>
              <p className="text-[11px] text-slate-500">Club & Academia Deportiva · Desde 2015</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <Link to="/" className="hover:text-teal-400">Inicio</Link>
            <Link to="/nosotros" className="hover:text-teal-400">Nosotros</Link>
            <Link to="/sedes" className="text-teal-400 font-bold">Sedes</Link>
            <Link to="/eventos" className="hover:text-teal-400">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400">Tienda</Link>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noreferrer" className="hover:text-teal-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-400" /> +51 963 896 985
            </a>
          </div>
          <p className="text-slate-600 text-center md:text-right">© {new Date().getFullYear()} Campeones Lima.</p>
        </div>
      </footer>
    </div>
  );
}